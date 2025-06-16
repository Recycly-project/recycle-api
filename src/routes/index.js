// File ini berfungsi sebagai agregator untuk semua definisi rute.
// Ini mengimpor semua file rute terpisah dan menggabungkannya menjadi satu array.
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const wasteCollectionRoutes = require('./wasteCollectionRoutes');
const rewardRoutes = require('./rewardRoutes');
const redeemRoutes = require('./redeemRoutes');
const qrCodeRoutes = require('./qrCodeRoutes');

// Menggabungkan semua array rute menjadi satu array tunggal
const allRoutes = [].concat(
  authRoutes,
  userRoutes,
  wasteCollectionRoutes,
  rewardRoutes,
  redeemRoutes,
  qrCodeRoutes
);

module.exports = allRoutes;
