const authHandler = require('../handler/authHandler');
const userHandler = require('../handler/userHandler');
const wasteCollectionHandler = require('../handler/wasteCollectionHandler');

const routes = [
  {
    method: 'POST',
    path: '/auth/register',
    handler: authHandler.registerHandler,
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
      pre: [{ method: authHandler.verifyToken }],
    },
  },
  {
    method: 'POST',
    path: '/users/{id}/waste-collections',
    handler: wasteCollectionHandler.createWasteCollectionHandler,
    options: {
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
];

module.exports = routes;
