const authHandler = require('../handler/authHandler');
const userHandler = require('../handler/userHandler');
const wasteCollectionHandler = require('../handler/wasteCollectionHandler');
const rewardHandler = require('../handler/rewardHandler');
const redeemHandler = require('../handler/redeemHandler');

const routes = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: authHandler.registerHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024,
        allow: 'multipart/form-data',
      },
    },
  },
  { method: 'POST', path: '/auth/login', handler: authHandler.loginHandler },
  {
    method: 'POST',
    path: '/auth/logout',
    handler: authHandler.logoutHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}/verify',
    handler: authHandler.updateKtpHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024,
        allow: 'multipart/form-data',
      },
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: userHandler.getUserByIdHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: userHandler.updateUserHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: userHandler.deleteUserHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/admin/users',
    handler: authHandler.getAllUsersHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'POST',
    path: '/users/{id}/waste-collections',
    handler: wasteCollectionHandler.createWasteCollectionHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024,
      },
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/users/{id}/waste-collections',
    handler: wasteCollectionHandler.getUserWasteCollectionsHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/rewards',
    handler: rewardHandler.getRewardsHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'POST',
    path: '/users/{id}/rewards/{rewardId}/redeem',
    handler: redeemHandler.redeemRewardHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/redeems',
    handler: redeemHandler.getRedeemHistoryHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'POST',
    path: '/admin/rewards',
    handler: rewardHandler.createRewardHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'PUT',
    path: '/admin/rewards/{rewardId}',
    handler: rewardHandler.updateRewardHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'DELETE',
    path: '/admin/rewards/{rewardId}',
    handler: rewardHandler.deleteRewardHandler,
    options: {
      pre: [{ method: authHandler.verifyToken, assign: 'auth' }],
    },
  },
];

module.exports = routes;
