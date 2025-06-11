// Definisi rute-rute terkait otentikasi (auth)
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Menggunakan middleware otentikasi

const authRoutes = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: authController.registerHandler,
    options: {
      payload: {
        output: 'stream', // Mengizinkan stream untuk file (KTP)
        parse: true,
        multipart: true, // Mengizinkan multipart/form-data
        maxBytes: 2 * 1024 * 1024, // Batas ukuran file 2MB
        allow: 'multipart/form-data',
      },
    },
  },
  {
    method: 'POST',
    path: '/auth/login',
    handler: authController.loginHandler,
  },
  {
    method: 'POST',
    path: '/auth/logout',
    handler: authController.logoutHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}/verify', // Endpoint untuk update KTP
    handler: authController.updateKtpHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024,
        allow: 'multipart/form-data',
      },
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'GET',
    path: '/admin/users', // Endpoint untuk mendapatkan semua pengguna (hanya admin)
    handler: authController.getAllUsersHandler,
    options: {
      pre: [
        { method: authMiddleware.verifyToken, assign: 'auth' }, // Verifikasi token dulu
        { method: authMiddleware.isAdmin }, // Lalu cek apakah user adalah admin
      ],
    },
  },
];

module.exports = authRoutes;
