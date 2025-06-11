// Definisi rute-rute terkait pengguna (user)
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Menggunakan middleware otentikasi

const userRoutes = [
  {
    method: 'GET',
    path: '/users/{id}', // Mendapatkan data pengguna berdasarkan ID
    handler: userController.getUserByIdHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}', // Memperbarui data pengguna berdasarkan ID
    handler: userController.updateUserHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'DELETE',
    path: '/users/{id}', // Menghapus pengguna berdasarkan ID
    handler: userController.deleteUserHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
];

module.exports = userRoutes;
