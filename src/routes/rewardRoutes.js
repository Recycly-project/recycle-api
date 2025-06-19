// Rute terkait reward

const rewardController = require('../controllers/rewardController');
const authMiddleware = require('../middlewares/authMiddleware');

const rewardRoutes = [
  {
    method: 'GET',
    path: '/rewards',
    handler: rewardController.getRewardsHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'POST',
    path: '/admin/rewards',
    handler: rewardController.createRewardHandler,
    options: {
      pre: [
        { method: authMiddleware.verifyToken, assign: 'auth' },
        { method: authMiddleware.isAdmin },
      ],
    },
  },
  {
    method: 'PUT',
    path: '/admin/rewards/{rewardId}',
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
    path: '/admin/rewards/{rewardId}',
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
