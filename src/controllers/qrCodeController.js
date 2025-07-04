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

// Fallback decoder dengan qrcode-reader
async function decodeWithQrReader(imagePath) {
  const image = await Jimp.read(imagePath);

  return new Promise((resolve, reject) => {
    const qr = new QrCode();
    qr.callback = (err, value) => {
      if (err || !value) {
        return reject(new Error('QR code tidak dapat dibaca'));
      }
      resolve(value.result);
    };
    qr.decode(image.bitmap);
  });
}

// ZXing decoding dengan variasi manipulasi
async function tryDecodeQRWithVariants(image) {
  const reader = new MultiFormatReader();
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  reader.setHints(hints);

  const variants = [];

  const v0 = image.clone().grayscale();
  const v90 = image.clone().rotate(90).grayscale();
  const v180 = image.clone().rotate(180).grayscale();
  const v270 = image.clone().rotate(270).grayscale();
  const vs = image.clone().scale(2).grayscale();

  variants.push(v0, v90, v180, v270, vs);

  for (const variant of variants) {
    try {
      const { data, width, height } = variant.bitmap;
      const luminance = new RGBLuminanceSource(data, width, height);
      const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminance));
      const result = reader.decode(binaryBitmap);
      if (result) return result;
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        console.warn('Unexpected decoding error:', err.message);
      }
    }
  }

  throw new NotFoundException('Tidak ada QR code yang terdeteksi di gambar.');
}

// Handler untuk scan QR code
const scanQrCodeHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { payload } = request;
  let tempPath = null;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    if (!payload || !payload.qrCodeImage) {
      return handleClientError(h, 'Gambar QR code tidak ditemukan.', 400);
    }

    tempPath = path.join(
      tempDir,
      `${Date.now()}-${payload.qrCodeImage.hapi.filename}`
    );
    await fsPromises.writeFile(tempPath, payload.qrCodeImage._data);

    let qrData = null;

    try {
      const image = await Jimp.read(tempPath);
      let decodedResult;

      try {
        // ZXing decoder utama
        decodedResult = await tryDecodeQRWithVariants(image);
        qrData = JSON.parse(decodedResult.getText());
      } catch (zxingErr) {
        console.warn('ZXing gagal:', zxingErr.message);
        // Fallback ke qrcode-reader
        console.warn('ZXing gagal, mencoba fallback qrcode-reader...');
        const fallbackText = await decodeWithQrReader(tempPath);
        qrData = JSON.parse(fallbackText);
      }
    } catch (decodeError) {
      console.error('Error processing QR code image:', decodeError);
      return handleClientError(
        h,
        'Gagal membaca QR code. Pastikan gambar valid.',
        400
      );
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        await fsPromises
          .unlink(tempPath)
          .catch((err) => console.error('Error deleting temp file:', err));
      }
    }

    const { id: qrCodeId, points, bottles, expiresAt } = qrData;

    if (
      !qrCodeId ||
      typeof points !== 'number' ||
      typeof bottles !== 'number' ||
      !expiresAt
    ) {
      return handleClientError(h, 'Data QR code tidak lengkap.', 400);
    }

    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      return handleClientError(h, 'Tanggal kedaluwarsa tidak valid.', 400);
    }

    if (expiryDate < new Date()) {
      return handleClientError(h, 'QR code sudah kedaluwarsa.', 400);
    }

    const existingQrEntry = await QrScanModel.findQrScanByQrCodeId(qrCodeId);
    if (existingQrEntry && existingQrEntry.isUsed) {
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

    return h
      .response({
        status: 'success',
        message: 'QR code berhasil dipindai & poin ditambahkan.',
        data: {
          qrCodeId,
          pointsAdded: points,
          bottlesCollected: bottles,
        },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal memproses QR code.');
  }
};

// Handler untuk ambil riwayat scan QR code
const getQrCodeHistoryHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    const qrCodeHistory = await QrScanModel.getUserQrScanHistory(userId);

    return h
      .response({
        status: 'success',
        message: 'Riwayat pemindaian QR code berhasil diambil.',
        data: { qrCodeHistory },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal mengambil riwayat QR code.');
  }
};

module.exports = {
  scanQrCodeHandler,
  getQrCodeHistoryHandler,
};
