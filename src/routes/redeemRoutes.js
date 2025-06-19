// Rute terkait penukaran reward (redeem)

const redeemController = require('../controllers/redeemController');
const authMiddleware = require('../middlewares/authMiddleware');

const redeemRoutes = [
  {
    method: 'POST',
    path: '/users/{id}/rewards/{rewardId}/redeem',
    handler: redeemController.redeemRewardHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/redeems',
    handler: redeemController.getRedeemHistoryHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
];

module.exports = redeemRoutes;
