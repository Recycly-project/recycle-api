require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { verifyToken } = require('./authHandler');

const prisma = new PrismaClient();

// URL API ML
const ML_API_URL = process.env.ML_API_URL;

// Direktori sementara untuk menyimpan file
const tempDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Fungsi untuk mengirim gambar ke API ML
const sendImageToML = async (imagePath) => {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));

  const apiResponse = await axios.post(ML_API_URL, formData, {
    headers: formData.getHeaders(),
  });

  return apiResponse.data;
};

// Handler untuk menangani koleksi sampah botol
const createWasteCollectionHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { payload } = request;

  try {
    // Validasi pengguna
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return h
        .response({
          status: 'fail',
          message: 'Pengguna tidak ditemukan',
        })
        .code(404);
    }

    // Validasi file gambar
    if (!payload || !payload.image) {
      return h
        .response({
          status: 'fail',
          message: 'Gambar tidak ditemukan dalam permintaan',
        })
        .code(400);
    }

    // Simpan gambar sementara
    const tempPath = path.join(
      __dirname,
      'uploads',
      `${Date.now()}-${payload.image.hapi.filename}`
    );
    await fsPromises.writeFile(tempPath, payload.image._data);

    // Kirim gambar ke API ML untuk validasi
    const { label, points } = await sendImageToML(tempPath);

    // Validasi label dari API ML
    if (label === 'Bottle Damage' || label === 'Not Bottle') {
      await fsPromises.unlink(tempPath); // Hapus file sementara
      return h
        .response({
          status: 'fail',
          message:
            label === 'Bottle Damage'
              ? 'Gambar ditolak karena botol dalam kondisi rusak.'
              : 'Gambar ditolak karena bukan botol.',
          data: { label },
        })
        .code(400);
    }

    // Kirim respons sukses awal
    const response = h
      .response({
        status: 'success',
        message: 'Gambar berhasil divalidasi. Proses penyimpanan berhasil.',
        data: { label, points },
      })
      .code(201);

    // Proses penyimpanan gambar secara asinkron
    const fileBuffer = await fsPromises.readFile(tempPath); // Konversi gambar ke buffer
    await fsPromises.unlink(tempPath); // Hapus file sementara setelah buffer dibuat

    // Simpan ke database dan update totalPoints pengguna
    await prisma.wasteCollection.create({
      data: {
        userId,
        label,
        points,
        image: fileBuffer,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
      },
    });

    return response;
  } catch (error) {
    console.error('Error in createWasteCollectionHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
        error: error.message,
      })
      .code(500);
  }
};

// Handler untuk mendapatkan daftar koleksi botol pengguna
const getUserWasteCollectionsHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return h
        .response({
          status: 'fail',
          message: 'Pengguna tidak ditemukan',
        })
        .code(404);
    }

    const wasteCollections = await prisma.wasteCollection.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        label: true,
        points: true,
        // image: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Konversi gambar ke Base64
    const formattedCollections = wasteCollections.map((collection) => ({
      ...collection,
      // image: collection.image.toString('base64'), // Konversi ke Base64
    }));

    return h
      .response({
        status: 'success',
        message: 'Daftar koleksi berhasil diambil.',
        data: { wasteCollections: formattedCollections },
      })
      .code(200);
  } catch (error) {
    console.error('Error in getUserWasteCollectionsHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
        error: error.message,
      })
      .code(500);
  }
};

module.exports = {
  createWasteCollectionHandler,
  getUserWasteCollectionsHandler,
  verifyToken,
};
