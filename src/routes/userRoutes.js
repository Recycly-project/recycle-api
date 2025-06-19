// Rute terkait pengguna (user)

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const userRoutes = [
  {
    method: 'GET',
    path: '/users/{id}',
    handler: userController.getUserByIdHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: userController.updateUserHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: userController.deleteUserHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
];

module.exports = userRoutes;
