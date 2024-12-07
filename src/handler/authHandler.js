require('dotenv').config();

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

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
    request.auth = { userId: decoded.id, isAdmin: decoded.isAdmin };

    return h.continue;
  } catch (error) {
    console.error('Error in verifyToken:', error);
    return h
      .response({
        status: 'fail',
        message: 'Token tidak valid',
      })
      .code(403)
      .takeover();
  }
};

// Handler untuk registrasi pengguna
const registerHandler = async (request, h) => {
  const { email, password, fullName, address, isAdmin } = request.payload;
  const file = request.payload.ktp; // Mendapatkan file KTP dari payload

  try {
    // Cek apakah email sudah digunakan
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return h
        .response({ status: 'fail', message: 'Email sudah digunakan' })
        .code(409);
    }

    // Proses hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validasi dan konversi file KTP ke buffer (jika ada)
    let ktpBuffer = null;
    if (file && file._data) {
      ktpBuffer = file._data; // Hapi.js menempatkan file upload di `_data`
    }

    // Simpan user baru di database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        address,
        ktp: ktpBuffer, // Menyimpan file KTP dalam bentuk buffer
        isAdmin: isAdmin !== undefined ? isAdmin : false,
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
    console.error('Error in registerHandler:', error);
    return h.response({ status: 'error', message: 'Server error' }).code(500);
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
      {
        expiresIn: '1h',
      }
    );

    // Exclude sensitive fields from the response
    const {
      // eslint-disable-next-line no-unused-vars
      password: _,
      ...userData
    } = user;

    return h
      .response({
        status: 'success',
        message: 'Login berhasil',
        data: { token, user: userData },
      })
      .code(200);
  } catch (error) {
    console.error('Error in loginHandler:', error);
    return h.response({ status: 'error', message: 'Server error' }).code(500);
  }
};

// Handler untuk update KTP
const updateKtpHandler = async (request, h) => {
  const { id } = request.params; // Mendapatkan ID pengguna dari URL
  const file = request.payload.ktp; // Mendapatkan file KTP dari payload

  try {
    // Validasi apakah user ada
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return h
        .response({ status: 'fail', message: 'Pengguna tidak ditemukan' })
        .code(404);
    }

    // Validasi file KTP dan konversi ke buffer
    let ktpBuffer = null;
    if (file && file._data) {
      ktpBuffer = file._data;
    } else {
      return h
        .response({ status: 'fail', message: 'File KTP tidak valid' })
        .code(400);
    }

    // Perbarui KTP di database
    await prisma.user.update({
      where: { id },
      data: { ktp: ktpBuffer },
    });

    return h
      .response({ status: 'success', message: 'KTP berhasil diperbarui' })
      .code(200);
  } catch (error) {
    console.error('Error in updateKtpHandler:', error);
    return h.response({ status: 'error', message: 'Server error' }).code(500);
  }
};

// Handler Mendapatkan daftar pengguna untuk admin
const getAllUsersHandler = async (request, h) => {
  // const { isAdmin } = request.auth;
  // console.log('User isAdmin:', isAdmin);

  // if (!isAdmin || isAdmin !== true) {
  //   return h
  //     .response({
  //       status: 'fail',
  //       message: 'Akses ditolak, hanya admin yang dapat mengakses',
  //     })
  //     .code(403);
  // }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        address: true,
        ktp: true,
        totalPoints: true,
        isAdmin: true,
      },
    });

    // Jika tidak ada pengguna, beri status yang sesuai
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
    console.error('Error in getAllUsersHandler:', error);
    return h
      .response({ status: 'error', message: 'Terjadi kesalahan pada server' })
      .code(500);
  }
};

// Handler untuk logout pengguna
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
