// Rute terkait otentikasi (auth)

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const authRoutes = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: authController.registerHandler,
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
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}/verify',
    handler: authController.updateKtpHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024,
        allow: 'multipart/form-data',
      },
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/admin/users',
    handler: authController.getAllUsersHandler,
    options: {
      pre: [
        { method: authMiddleware.verifyToken, assign: 'auth' },
        { method: authMiddleware.isAdmin },
      ],
    },
  },
];

module.exports = authRoutes;
