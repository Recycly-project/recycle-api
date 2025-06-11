// Definisi rute-rute terkait penukaran reward (redeem)
const redeemController = require('../controllers/redeemController');
const authMiddleware = require('../middlewares/authMiddleware'); // Menggunakan middleware otentikasi

const redeemRoutes = [
  {
    method: 'POST',
    path: '/users/{id}/rewards/{rewardId}/redeem', // Melakukan penukaran reward
    handler: redeemController.redeemRewardHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
  {
    method: 'GET',
    path: '/redeems', // Mendapatkan riwayat penukaran pengguna
    handler: redeemController.getRedeemHistoryHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }], // Membutuhkan token yang valid
    },
  },
];

module.exports = redeemRoutes;
