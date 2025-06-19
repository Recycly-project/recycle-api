// File ini berfungsi sebagai agregator untuk semua definisi rute.
// Ini mengimpor semua file rute terpisah dan menggabungkannya menjadi satu array.
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const wasteCollectionRoutes = require('./wasteCollectionRoutes');
const rewardRoutes = require('./rewardRoutes');
const redeemRoutes = require('./redeemRoutes');
const qrCodeRoutes = require('./qrCodeRoutes');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response({
        status: 'success',
        message: 'Recycle API server is running 🚀',
      });
    },
  },

  // Menggabungkan semua array rute menjadi satu array tunggal
  ...authRoutes,
  ...userRoutes,
  ...rewardRoutes,
  ...redeemRoutes,
  ...qrCodeRoutes,
  ...wasteCollectionRoutes,
];

module.exports = routes;
