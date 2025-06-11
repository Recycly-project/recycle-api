// Middleware untuk verifikasi token JWT dan otorisasi berbasis peran (isAdmin).
const jwt = require('jsonwebtoken');
const config = require('../config'); // Mengambil JWT_SECRET dari konfigurasi global

// Fungsi middleware untuk memverifikasi token JWT
const verifyToken = (request, h) => {
  const authHeader = request.headers.authorization;

  // Cek apakah header Authorization ada
  if (!authHeader) {
    return h
      .response({
        status: 'fail',
        message: 'Token otentikasi tidak ada',
      })
      .code(401)
      .takeover(); // Hentikan alur permintaan
  }

  // Ambil token dari header (format: Bearer <token>)
  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi token menggunakan JWT_SECRET
    const decoded = jwt.verify(token, config.jwtSecret);
    // Simpan informasi user (userId dan isAdmin) di objek request untuk handler berikutnya
    request.auth = { userId: decoded.userId, isAdmin: decoded.isAdmin };

    return h.continue; // Lanjutkan ke handler berikutnya
  } catch (error) {
    console.error('Error in verifyToken:', error.message); // Catat error untuk debugging
    return h
      .response({
        status: 'fail',
        message: 'Token tidak valid atau telah kedaluwarsa',
      })
      .code(403)
      .takeover(); // Hentikan alur permintaan
  }
};

// Fungsi middleware untuk memeriksa apakah pengguna adalah admin
const isAdmin = (request, h) => {
  // Cek apakah request.auth ada dan isAdmin adalah true
  if (!request.auth || !request.auth.isAdmin) {
    return h
      .response({
        status: 'fail',
        message: 'Akses ditolak. Anda bukan administrator.',
      })
      .code(403)
      .takeover(); // Hentikan alur permintaan
  }
  return h.continue; // Lanjutkan ke handler berikutnya
};

module.exports = {
  verifyToken,
  isAdmin,
};
