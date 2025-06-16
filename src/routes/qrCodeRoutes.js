const qrCodeController = require('../controllers/qrCodeController');
const authMiddleware = require('../middlewares/authMiddleware'); // Menggunakan middleware otentikasi

const qrCodeRoutes = [
  {
    method: 'POST',
    path: '/users/{id}/scan-qr', // Endpoint untuk memindai gambar QR code
    handler: qrCodeController.scanQrCodeHandler,
    options: {
      payload: {
        output: 'stream', // Menerima data sebagai stream
        parse: true, // Mem-parsing payload
        multipart: true, // Mengizinkan multipart/form-data (untuk upload file)
        maxBytes: 2 * 1024 * 1024, // Batas ukuran file 2MB
        allow: 'multipart/form-data', // Hanya izinkan multipart/form-data
      },
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'GET',
    path: '/users/{id}/qr-history', // Mendapatkan riwayat pemindaian QR code pengguna
    handler: qrCodeController.getQrCodeHistoryHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
];

module.exports = qrCodeRoutes;
