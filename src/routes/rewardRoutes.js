// Definisi rute-rute terkait reward
const rewardController = require('../controllers/rewardController');
const authMiddleware = require('../middlewares/authMiddleware'); // Menggunakan middleware otentikasi

const rewardRoutes = [
  {
    method: 'GET',
    path: '/rewards', // Mendapatkan daftar semua reward
    handler: rewardController.getRewardsHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'POST',
    path: '/admin/rewards', // Menambahkan reward baru (hanya admin)
    handler: rewardController.createRewardHandler,
    options: {
      pre: [
        { method: authMiddleware.verifyToken, assign: 'auth' },
        { method: authMiddleware.isAdmin }, // Hanya admin yang bisa akses
      ],
    },
  },
  {
    method: 'PUT',
    path: '/admin/rewards/{rewardId}', // Memperbarui reward (hanya admin)
    handler: rewardController.updateRewardHandler,
    options: {
      pre: [
        { method: authMiddleware.verifyToken, assign: 'auth' },
        { method: authMiddleware.isAdmin },
      ],
    },
  },
  {
    method: 'DELETE',
    path: '/admin/rewards/{rewardId}', // Menghapus reward (hanya admin)
    handler: rewardController.deleteRewardHandler,
    options: {
      pre: [
        { method: authMiddleware.verifyToken, assign: 'auth' },
        { method: authMiddleware.isAdmin },
      ],
    },
  },
];

module.exports = rewardRoutes;
