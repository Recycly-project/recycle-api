const authHandler = require('../handler/authHandler');
const userHandler = require('../handler/userHandler');

const routes = [
  {
    method: 'POST',
    path: '/users/auth/register',
    handler: authHandler.registerHandler,
  },
  {
    method: 'POST',
    path: '/users/auth/login',
    handler: authHandler.loginHandler,
  },
  {
    method: 'POST',
    path: '/users/auth/logout',
    handler: authHandler.logoutHandler,
    options: {
      pre: [authHandler.verifyToken],
    },
  },
  {
    method: 'GET',
    path: '/users',
    handler: userHandler.getAllUsersHandler,
    options: {
      pre: [authHandler.verifyToken],
    },
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: userHandler.getUserByIdHandler,
    options: {
      pre: [authHandler.verifyToken],
    },
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: userHandler.updateUserHandler,
    options: {
      pre: [authHandler.verifyToken],
    },
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: userHandler.deleteUserHandler,
    options: {
      pre: [authHandler.verifyToken],
    },
  },
];

module.exports = routes;
