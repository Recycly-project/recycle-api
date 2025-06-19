// Rute terkait koleksi sampah

const wasteCollectionController = require('../controllers/wasteCollectionController');
const authMiddleware = require('../middlewares/authMiddleware');

const wasteCollectionRoutes = [
  {
    method: 'POST',
    path: '/users/{id}/waste-collections',
    handler: wasteCollectionController.createWasteCollectionHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024,
      },
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
  {
    method: 'GET',
    path: '/users/{id}/waste-collections',
    handler: wasteCollectionController.getUserWasteCollectionsHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
];

module.exports = wasteCollectionRoutes;
