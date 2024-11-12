const userHandler = require('../handler/userHandler');
const authHandler = require('../handler/authHandler');

const routes = [
  {
    method: 'GET',
    path: '/users',
    handler: userHandler.getUsersHandler,
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: userHandler.getUserByIdHandler,
  },
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: userHandler.updateUserHandler,
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: userHandler.deleteUserHandler,
  },
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
  },
];

module.exports = routes;
