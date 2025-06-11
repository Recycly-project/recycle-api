// Model ini menangani operasi terkait entitas 'WasteCollection'.
const prisma = require('../database/prisma');

const WasteCollectionModel = {
  // Membuat entri koleksi sampah baru
  async createWasteCollection(data) {
    return await prisma.wasteCollection.create({ data });
  },

  // Mendapatkan daftar koleksi sampah untuk pengguna tertentu
  async getUserWasteCollections(userId) {
    return await prisma.wasteCollection.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        label: true,
        points: true,
        createdAt: true,
        // Kolom 'image' (BYTEA) biasanya tidak dikembalikan dalam respons API
        // kecuali ada kebutuhan khusus untuk menampilkan gambar langsung dari API.
        // Jika dibutuhkan, Anda bisa mengaktifkan kembali 'image: true'
        // dan melakukan konversi ke Base64 di controller jika perlu.
      },
      orderBy: { createdAt: 'desc' }, // Urutkan berdasarkan waktu terbaru
    });
  },
};

module.exports = WasteCollectionModel;
