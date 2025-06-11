// Definisi rute-rute terkait koleksi sampah
const wasteCollectionController = require('../controllers/wasteCollectionController');
const authMiddleware = require('../middlewares/authMiddleware'); // Menggunakan middleware otentikasi

const wasteCollectionRoutes = [
  {
    method: 'POST',
    path: '/users/{id}/waste-collections', // Mengunggah gambar koleksi sampah
    handler: wasteCollectionController.createWasteCollectionHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024, // Batas ukuran file 2MB
      },
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'GET',
    path: '/users/{id}/waste-collections', // Mendapatkan riwayat koleksi sampah pengguna
    handler: wasteCollectionController.getUserWasteCollectionsHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
];

module.exports = wasteCollectionRoutes;
