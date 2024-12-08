require('dotenv').config();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Middleware untuk verifikasi token
const verifyToken = (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return h
      .response({
        status: 'fail',
        message: 'Token tidak ada',
      })
      .code(401)
      .takeover();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.auth = { userId: decoded.userId, isAdmin: decoded.isAdmin };

    return h.continue;
  } catch (error) {
    console.error('Error in verifyToken:', error.message);
    return h
      .response({
        status: 'fail',
        message: 'Token tidak valid atau telah kedaluwarsa',
      })
      .code(403)
      .takeover();
  }
};

// Handler untuk registrasi pengguna
const registerHandler = async (request, h) => {
  const { email, password, fullName, address, isAdmin } = request.payload;
  const file = request.payload.ktp;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return h
        .response({ status: 'fail', message: 'Email sudah digunakan' })
        .code(409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let ktpBuffer = null;

    if (file && file._data) {
      ktpBuffer = file._data;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        address,
        ktp: ktpBuffer,
        isAdmin: isAdmin || false,
      },
    });

    return h
      .response({
        status: 'success',
        message: 'Registrasi berhasil',
        data: { userId: newUser.id },
      })
      .code(201);
  } catch (error) {
    console.error('Error in registerHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler untuk login pengguna
const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return h
        .response({ status: 'fail', message: 'Email atau password salah' })
        .code(401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return h
        .response({ status: 'fail', message: 'Email atau password salah' })
        .code(401);
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return h
      .response({
        status: 'success',
        message: 'Login berhasil',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            isAdmin: user.isAdmin,
          },
        },
      })
      .code(200);
  } catch (error) {
    console.error('Error in loginHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler untuk update KTP
const updateKtpHandler = async (request, h) => {
  const { id } = request.params;
  const file = request.payload.ktp;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return h
        .response({ status: 'fail', message: 'Pengguna tidak ditemukan' })
        .code(404);
    }

    if (!file || !file._data) {
      return h
        .response({ status: 'fail', message: 'File KTP tidak valid' })
        .code(400);
    }

    await prisma.user.update({
      where: { id },
      data: { ktp: file._data },
    });

    return h
      .response({
        status: 'success',
        message: 'KTP berhasil diperbarui',
      })
      .code(200);
  } catch (error) {
    console.error('Error in updateKtpHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler untuk mendapatkan daftar pengguna
const getAllUsersHandler = async (request, h) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        totalPoints: true,
        isAdmin: true,
      },
    });

    if (users.length === 0) {
      return h
        .response({
          status: 'fail',
          message: 'Tidak ada pengguna ditemukan',
        })
        .code(404);
    }

    return h
      .response({
        status: 'success',
        message: 'Daftar pengguna berhasil diambil',
        data: { users },
      })
      .code(200);
  } catch (error) {
    console.error('Error in getAllUsersHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler untuk logout
const logoutHandler = async (request, h) => {
  return h
    .response({ status: 'success', message: 'Logout berhasil' })
    .code(200);
};

module.exports = {
  registerHandler,
  loginHandler,
  updateKtpHandler,
  getAllUsersHandler,
  logoutHandler,
  verifyToken,
};
