const QrScanModel = require('../models/qrScanModel');
const UserModel = require('../models/userModel');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');
const { Jimp } = require('jimp'); // Menggunakan destructuring untuk mengimpor kelas Jimp
const jsQR = require('jsqr');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const prisma = require('../database/prisma');

// Direktori sementara untuk menyimpan file yang diunggah (di root proyek)
const tempDir = path.join(process.cwd(), 'uploads');
// Pastikan direktori 'uploads' ada
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

/**
 * Handler untuk memindai gambar QR code, memvalidasi data, dan menambahkan poin.
 * Endpoint: POST /users/{id}/scan-qr
 * @param {object} request - Objek permintaan Hapi.
 * @param {object} h - Objek respons Hapi.
 * @returns {Promise<Hapi.ResponseObject>} Objek respons Hapi.
 */
const scanQrCodeHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { payload } = request;

  let tempPath = null; // Deklarasikan tempPath di luar blok try untuk memastikan bisa diakses di finally

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    if (!payload || !payload.qrCodeImage) {
      return handleClientError(
        h,
        'Gambar QR code tidak ditemukan dalam permintaan',
        400
      );
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
        return handleClientError(
          h,
          'Tidak dapat memindai QR code dari gambar atau data tidak valid.',
          400
        );
      }
    } catch (jimpOrJsQRError) {
      console.error('Error processing QR code image:', jimpOrJsQRError);

      // Tangani error Jimp spesifik "Could not find MIME for Buffer" sebagai client error
      if (
        jimpOrJsQRError.message &&
        jimpOrJsQRError.message.includes('Could not find MIME for Buffer')
      ) {
        return handleClientError(
          h,
          'File gambar yang diunggah tidak dikenali sebagai gambar yang valid. Pastikan format file benar (PNG/JPEG) dan tidak rusak.',
          400
        );
      }

      // Untuk error Jimp/jsQR lainnya yang tidak spesifik MIME, re-throw
      throw jimpOrJsQRError;
    } finally {
      // Pastikan file sementara dihapus setelah diproses, berhasil atau gagal
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
      return handleClientError(
        h,
        'Data QR code tidak lengkap atau tidak valid.',
        400
      );
    }

    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      return handleClientError(
        h,
        'Format tanggal kedaluwarsa QR code tidak valid.',
        400
      );
    }

    if (expiryDate < new Date()) {
      return handleClientError(h, 'QR code sudah kedaluwarsa.', 400);
    }

    const existingQrEntry = await QrScanModel.findQrScanByQrCodeId(qrCodeId);
    if (existingQrEntry && existingQrEntry.isUsed) {
      return handleClientError(h, 'QR code ini sudah pernah digunakan.', 409);
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
        message: 'QR code berhasil dipindai dan poin ditambahkan.',
        data: {
          qrCodeId,
          pointsAdded: points,
          bottlesCollected: bottles,
        },
      })
      .code(200);
  } catch (error) {
    // Tangani error server umum atau error yang di-re-throw dari blok try/catch internal
    return handleServerError(h, error, 'Gagal memproses gambar QR code.');
  }
};

/**
 * Handler untuk mendapatkan riwayat pemindaian QR code pengguna.
 * Endpoint: GET /users/{id}/qr-history
 * @param {object} request - Objek permintaan Hapi.
 * @param {object} h - Objek respons Hapi.
 * @returns {Promise<Hapi.ResponseObject>} Objek respons Hapi.
 */
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
    return handleServerError(
      h,
      error,
      'Gagal mengambil riwayat pemindaian QR code.'
    );
  }
};

module.exports = {
  scanQrCodeHandler,
  getQrCodeHistoryHandler,
};
