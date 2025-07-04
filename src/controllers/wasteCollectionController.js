// Controller koleksi sampah

const WasteCollectionModel = require('../models/wasteCollectionModel');
const UserModel = require('../models/userModel');
const { sendImageToML } = require('../utils/mlService');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

// Setup direktori sementara upload
const tempDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Handler tambah koleksi sampah
const createWasteCollectionHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { payload } = request;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      console.warn(`[404] User not found for waste collection: ${userId}`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    if (!payload || !payload.image) {
      console.warn(`[400] No image uploaded by user: ${userId}`);
      return handleClientError(h, 'Gambar tidak ditemukan.', 400);
    }

    // Simpan gambar sementara
    const tempPath = path.join(
      tempDir,
      `${Date.now()}-${payload.image.hapi.filename}`
    );
    await fsPromises.writeFile(tempPath, payload.image._data);
    console.log(`[201] Image uploaded to temp: ${tempPath}`);

    // Kirim ke ML service
    const { label, points } = await sendImageToML(tempPath);
    console.log(`[200] ML result - label: ${label}, points: ${points}`);

    // Validasi hasil ML
    if (label === 'Bottle Damage' || label === 'Non Bottle') {
      await fsPromises.unlink(tempPath);
      console.warn(`[400] Invalid label from ML: ${label}`);
      return handleClientError(
        h,
        label === 'Bottle Damage'
          ? 'Botol rusak. Gambar ditolak.'
          : 'Bukan botol. Gambar ditolak.',
        400,
        { label }
      );
    }

    // Simpan ke DB
    const fileBuffer = await fsPromises.readFile(tempPath);
    await fsPromises.unlink(tempPath);

    await WasteCollectionModel.createWasteCollection({
      userId,
      label,
      points,
      image: fileBuffer,
    });

    await UserModel.incrementUserPoints(userId, points);

    console.log(`[201] Waste collection recorded for user: ${userId}`);
    return h
      .response({
        status: 'success',
        message: 'Gambar valid. Poin ditambahkan.',
        data: { label, points },
      })
      .code(201);
  } catch (error) {
    console.error(
      `[500] Failed to process waste collection for user: ${userId}`,
      error
    );
    return handleServerError(h, error, 'Gagal memproses koleksi sampah.');
  }
};

// Handler ambil koleksi sampah user
const getUserWasteCollectionsHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      console.warn(`[404] User not found for fetching collections: ${userId}`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    const wasteCollections = await WasteCollectionModel.getUserWasteCollections(
      userId
    );

    console.log(`[200] Waste collections fetched for user: ${userId}`);
    return h
      .response({
        status: 'success',
        message: 'Daftar koleksi berhasil diambil.',
        data: { wasteCollections },
      })
      .code(200);
  } catch (error) {
    console.error(
      `[500] Failed to fetch waste collections for user: ${userId}`,
      error
    );
    return handleServerError(
      h,
      error,
      'Gagal mengambil daftar koleksi sampah.'
    );
  }
};

module.exports = {
  createWasteCollectionHandler,
  getUserWasteCollectionsHandler,
};
