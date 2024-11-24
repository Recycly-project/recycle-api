require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const { verifyToken } = require('./authHandler');

const prisma = new PrismaClient();

// URL API ML (gunakan environment variable untuk keamanan)
const ML_API_URL = process.env.ML_API_URL;

// Handler untuk menambahkan koleksi sampah botol
const createWasteCollectionHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { payload } = request;

  try {
    // Validasi pengguna
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return h
        .response({ status: 'fail', message: 'Pengguna tidak ditemukan' })
        .code(404);
    }

    // Pastikan file gambar ada dalam request payload
    if (!payload || !payload.image || !payload.image.path) {
      return h
        .response({
          status: 'fail',
          message: 'Gambar tidak ditemukan dalam permintaan',
        })
        .code(400);
    }

    // Validasi file gambar
    const absolutePath = path.resolve(payload.image.path);
    if (!fs.existsSync(absolutePath)) {
      return h
        .response({
          status: 'fail',
          message: 'File gambar tidak ditemukan di server',
        })
        .code(400);
    }

    // Kirim gambar ke API ML untuk validasi
    const formData = new FormData();
    formData.append('image', fs.createReadStream(absolutePath));

    const apiResponse = await axios.post(ML_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const { label, points } = apiResponse.data;

    // Validasi berdasarkan label dari API ML
    if (label === 'Botol Rusak' || label === 'Bukan Botol') {
      return h
        .response({ status: 'fail', message: `Gagal: ${label}` })
        .code(400);
    }

    // Simpan data koleksi sampah yang valid ke database
    const newCollection = await prisma.wasteCollection.create({
      data: {
        userId,
        label,
        points,
      },
    });

    // Update totalPoints pengguna
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: points,
        },
      },
    });

    return h
      .response({
        status: 'success',
        message: 'Koleksi sampah berhasil ditambahkan',
        data: { wasteCollection: newCollection },
      })
      .code(201);
  } catch (error) {
    console.error('Error in createWasteCollectionHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

// Handler untuk mendapatkan daftar koleksi botol pengguna
const getUserWasteCollectionsHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const wasteCollections = await prisma.wasteCollection.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        label: true,
        points: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return h
      .response({
        status: 'success',
        message: 'Daftar koleksi berhasil diambil',
        data: { wasteCollections },
      })
      .code(200);
  } catch (error) {
    console.error('Error in getUserWasteCollectionsHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

module.exports = {
  createWasteCollectionHandler,
  getUserWasteCollectionsHandler,
  verifyToken,
};
