// Controller QR Code: Scan & Riwayat

const QrScanModel = require('../models/qrScanModel');
const UserModel = require('../models/userModel');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  NotFoundException,
} = require('@zxing/library');

const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const prisma = require('../database/prisma');

// Setup direktori sementara
const tempDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Fallback decoder menggunakan qrcode-reader
async function decodeWithQrReader(imagePath) {
  const image = await Jimp.read(imagePath);
  const variants = [
    image.clone(),
    image.clone().grayscale().contrast(1),
    image.clone().scale(2),
    image.clone().scale(3).contrast(1),
  ];

  for (const variant of variants) {
    try {
      const result = await new Promise((resolve, reject) => {
        const qr = new QrCode();
        qr.callback = (err, value) => {
          if (err || !value)
            return reject(new Error('QR code tidak dapat dibaca'));
          resolve(value.result);
        };
        qr.decode(variant.bitmap);
      });

      console.info('Berhasil decode dengan qrcode-reader');
      return result;
    } catch {
      continue;
    }
  }

  throw new Error('QR code tidak dapat dibaca dengan qrcode-reader');
}

// ZXing decoder utama
async function tryDecodeQRWithVariants(image) {
  const reader = new MultiFormatReader();
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  reader.setHints(hints);

  const variants = [
    image.clone().grayscale(),
    image.clone().rotate(90).grayscale(),
    image.clone().rotate(180).grayscale(),
    image.clone().rotate(270).grayscale(),
    image.clone().scale(2).grayscale(),
  ];

  for (const variant of variants) {
    try {
      const { data, width, height } = variant.bitmap;
      const luminance = new RGBLuminanceSource(data, width, height);
      const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminance));
      const result = reader.decode(binaryBitmap);
      console.info('Berhasil decode dengan ZXing');
      return result;
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        console.warn('ZXing unexpected error:', err.message);
      }
    }
  }

  throw new NotFoundException('Tidak ada QR code yang terdeteksi di gambar.');
}

// Handler utama
const scanQrCodeHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { payload } = request;
  let tempPath = null;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      console.warn(`User ID ${userId} tidak ditemukan [404]`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    if (!payload || !payload.qrCodeImage) {
      console.warn(`Payload image kosong untuk user ID ${userId} [400]`);
      return handleClientError(h, 'Gambar QR code tidak ditemukan.', 400);
    }

    tempPath = path.join(
      tempDir,
      `${Date.now()}-${payload.qrCodeImage.hapi.filename}`
    );
    await fsPromises.writeFile(tempPath, payload.qrCodeImage._data);

    let qrData = null;
    let decoderUsed = 'zxing';

    try {
      const image = await Jimp.read(tempPath);

      try {
        const decodedResult = await tryDecodeQRWithVariants(image);
        qrData = JSON.parse(decodedResult.getText());
      } catch (zxingErr) {
        decoderUsed = 'qrcode-reader';
        console.info('ZXing gagal:', zxingErr.message);
        console.info('[Fallback] Mencoba qrcode-reader...');
        const fallbackText = await decodeWithQrReader(tempPath);
        qrData = JSON.parse(fallbackText);
      }
    } catch (decodeError) {
      console.error('Error processing QR code image:', decodeError);
      return handleClientError(
        h,
        'Gagal membaca QR code. Pastikan gambar cukup terang dan fokus.',
        400
      );
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        await fsPromises.unlink(tempPath).catch((err) => {
          console.error('Error deleting temp file:', err);
        });
      }
    }

    const { id: qrCodeId, points, bottles, expiresAt } = qrData;

    if (
      !qrCodeId ||
      typeof points !== 'number' ||
      typeof bottles !== 'number' ||
      !expiresAt
    ) {
      console.warn(`Data QR tidak lengkap: ${JSON.stringify(qrData)} [400]`);
      return handleClientError(h, 'Data QR code tidak lengkap.', 400);
    }

    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      console.warn(`Tanggal kadaluarsa tidak valid: ${expiresAt} [400]`);
      return handleClientError(h, 'Tanggal kedaluwarsa tidak valid.', 400);
    }

    if (expiryDate < new Date()) {
      console.warn(`QR code kedaluwarsa: ${qrCodeId} [400]`);
      return handleClientError(h, 'QR code sudah kedaluwarsa.', 400);
    }

    const existingQrEntry = await QrScanModel.findQrScanByQrCodeId(qrCodeId);
    if (existingQrEntry && existingQrEntry.isUsed) {
      console.warn(`QR code sudah digunakan: ${qrCodeId} [409]`);
      return handleClientError(h, 'QR code sudah pernah digunakan.', 409);
    }

    await prisma.$transaction(async (tx) => {
      await QrScanModel.createQrScanEntry(
        {
          qrCodeId,
          points,
          bottles,
          expiresAt: expiryDate,
          isUsed: true,
          userId: user.id,
        },
        tx
      );
      await UserModel.incrementUserPoints(userId, points, tx);
    });

    console.info(
      `QR berhasil: ${qrCodeId} | Poin: ${points} | Decoder: ${decoderUsed} [200]`
    );

    return h
      .response({
        status: 'success',
        message: 'QR code berhasil dipindai & poin ditambahkan.',
        data: {
          qrCodeId,
          pointsAdded: points,
          bottlesCollected: bottles,
          decoder: decoderUsed,
        },
      })
      .code(200);
  } catch (error) {
    console.error('Internal server error [500]:', error);
    return handleServerError(h, error, 'Gagal memproses QR code.');
  }
};

// Handler untuk riwayat pemindaian
const getQrCodeHistoryHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      console.warn(`User ID ${userId} tidak ditemukan [404]`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    const qrCodeHistory = await QrScanModel.getUserQrScanHistory(userId);
    console.info(`Riwayat berhasil diambil untuk user ${userId} [200]`);

    return h
      .response({
        status: 'success',
        message: 'Riwayat pemindaian QR code berhasil diambil.',
        data: { qrCodeHistory },
      })
      .code(200);
  } catch (error) {
    console.error('Gagal mengambil riwayat [500]:', error);
    return handleServerError(h, error, 'Gagal mengambil riwayat QR code.');
  }
};

module.exports = {
  scanQrCodeHandler,
  getQrCodeHistoryHandler,
};
