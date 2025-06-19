// Rute terkait pemindaian QR code

const qrCodeController = require('../controllers/qrCodeController');
const authMiddleware = require('../middlewares/authMiddleware');

const qrCodeRoutes = [
  {
    method: 'POST',
    path: '/users/{id}/scan-qr',
    handler: qrCodeController.scanQrCodeHandler,
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
    path: '/users/{id}/qr-history',
    handler: qrCodeController.getQrCodeHistoryHandler,
    options: {
      pre: [{ method: authMiddleware.verifyToken, assign: 'auth' }],
    },
  },
];

module.exports = qrCodeRoutes;
