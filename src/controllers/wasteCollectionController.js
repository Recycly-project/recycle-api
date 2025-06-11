// Controller ini menangani logika terkait koleksi sampah.
const WasteCollectionModel = require('../models/wasteCollectionModel'); // Menggunakan WasteCollectionModel
const UserModel = require('../models/userModel'); // Menggunakan UserModel untuk update poin
const { sendImageToML } = require('../utils/mlService'); // Menggunakan ML Service
const fsPromises = require('fs').promises; // Untuk operasi file asinkron
const fs = require('fs'); // Untuk cek direktori
const path = require('path'); // Untuk manipulasi path
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

// Direktori sementara untuk menyimpan file yang diunggah (di root proyek)
const tempDir = path.join(process.cwd(), 'uploads');
// Pastikan direktori 'uploads' ada
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const createWasteCollectionHandler = async (request, h) => {
  const { id: userId } = request.params; // ID pengguna dari parameter URL
  const { payload } = request; // Data payload (termasuk gambar)

  try {
    const user = await UserModel.findUserById(userId); // Verifikasi pengguna
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    if (!payload || !payload.image) {
      return handleClientError(
        h,
        'Gambar tidak ditemukan dalam permintaan',
        400
      );
    }

    // Simpan gambar yang diunggah sementara ke disk
    const tempPath = path.join(
      tempDir,
      `${Date.now()}-${payload.image.hapi.filename}`
    );
    await fsPromises.writeFile(tempPath, payload.image._data);

    // Kirim gambar ke ML API untuk klasifikasi dan perhitungan poin
    const { label, points } = await sendImageToML(tempPath);

    // Validasi hasil dari ML API
    if (label === 'Bottle Damage' || label === 'Non Bottle') {
      await fsPromises.unlink(tempPath); // Hapus file sementara
      return handleClientError(
        h,
        label === 'Bottle Damage'
          ? 'Gambar ditolak karena botol dalam kondisi rusak.'
          : 'Gambar ditolak karena bukan botol.',
        400,
        { label } // Sertakan label dari ML API
      );
    }

    // Baca kembali gambar sebagai buffer untuk disimpan di database (jika diperlukan)
    const fileBuffer = await fsPromises.readFile(tempPath);
    await fsPromises.unlink(tempPath); // Hapus file sementara setelah dibaca

    // Buat entri koleksi sampah di database menggunakan model
    await WasteCollectionModel.createWasteCollection({
      userId,
      label,
      points,
      image: fileBuffer, // Simpan gambar sebagai BYTEA
    });

    // Tambahkan poin ke total poin pengguna menggunakan model
    await UserModel.incrementUserPoints(userId, points);

    return h
      .response({
        status: 'success',
        message: 'Gambar berhasil divalidasi dan poin ditambahkan.',
        data: { label, points },
      })
      .code(201);
  } catch (error) {
    return handleServerError(h, error, 'Gagal memproses koleksi sampah.');
  }
};

const getUserWasteCollectionsHandler = async (request, h) => {
  const { id: userId } = request.params; // ID pengguna dari parameter URL

  try {
    const user = await UserModel.findUserById(userId); // Verifikasi pengguna
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    // Dapatkan daftar koleksi sampah pengguna menggunakan model
    const wasteCollections = await WasteCollectionModel.getUserWasteCollections(
      userId
    );

    return h
      .response({
        status: 'success',
        message: 'Daftar koleksi berhasil diambil.',
        data: { wasteCollections: wasteCollections },
      })
      .code(200);
  } catch (error) {
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
