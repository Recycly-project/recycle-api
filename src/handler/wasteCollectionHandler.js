const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('./authHandler');

// Handler untuk menambahkan koleksi sampah botol
const createWasteCollectionHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { quantity, isBottle, bottleCode, points } = request.payload;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return h
        .response({ status: 'fail', message: 'Pengguna tidak ditemukan' })
        .code(404);
    }

    // Validasi apakah isBottle adalah false
    if (!isBottle) {
      return h
        .response({
          status: 'fail',
          message: 'Hanya botol yang dapat diterima untuk koleksi ini.',
        })
        .code(400);
    }

    // Tambahkan koleksi ke database
    const newCollection = await prisma.wasteCollection.create({
      data: {
        userId,
        quantity,
        isBottle,
        bottleCode,
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
        quantity: true,
        isBottle: true,
        bottleCode: true,
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
