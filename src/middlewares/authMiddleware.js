// Middleware verifikasi JWT & otorisasi admin

const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware verifikasi token JWT
const verifyToken = (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return h
      .response({
        status: 'fail',
        message: 'Token otentikasi tidak ada.',
      })
      .code(401)
      .takeover();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    request.auth = { userId: decoded.userId, isAdmin: decoded.isAdmin };

    return h.continue;
  } catch (error) {
    console.error('verifyToken error:', error.message);
    return h
      .response({
        status: 'fail',
        message: 'Token tidak valid atau telah kedaluwarsa.',
      })
      .code(403)
      .takeover();
  }
};

// Middleware cek role admin
const isAdmin = (request, h) => {
  if (!request.auth || !request.auth.isAdmin) {
    return h
      .response({
        status: 'fail',
        message: 'Akses ditolak. Anda bukan administrator.',
      })
      .code(403)
      .takeover();
  }

  return h.continue;
};

module.exports = {
  verifyToken,
  isAdmin,
};
