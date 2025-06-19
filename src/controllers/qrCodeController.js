// Controller QR Code: scan & riwayat

const QrScanModel = require('../models/qrScanModel');
const UserModel = require('../models/userModel');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');
const { Jimp } = require('jimp');
const jsQR = require('jsqr');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const prisma = require('../database/prisma');

// Setup direktori sementara
const tempDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
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
      const { data, width, height } = image.bitmap;
      const code = jsQR(new Uint8ClampedArray(data), width, height);

      if (code && code.data) {
        qrData = JSON.parse(code.data);
      } else {
        return handleClientError(h, 'QR code tidak valid.', 400);
      }
    } catch (jimpOrJsQRError) {
      console.error('Error processing QR code image:', jimpOrJsQRError);

      if (
        jimpOrJsQRError.message &&
        jimpOrJsQRError.message.includes('Could not find MIME for Buffer')
      ) {
        return handleClientError(
          h,
          'Format file tidak dikenali. Gunakan PNG/JPEG yang valid.',
          400
        );
      }

      throw jimpOrJsQRError;
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

      await UserModel.incrementUserPoints(userId, points, (tx = prisma));
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
