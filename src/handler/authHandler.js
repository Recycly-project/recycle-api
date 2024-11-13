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
    // Verifikasi token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Menambahkan userId dari token ke request.auth
    request.auth = {
      userId: decoded.userId,
    };
    return h.continue; // Melanjutkan ke handler berikutnya
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

// POST /users/auth/register
const registerHandler = async (request, h) => {
  const { email, username, password, fullName, address, ktp } = request.payload;

  try {
    // Import nanoid dynamically
    const { nanoid } = await import('nanoid');
    const userId = nanoid(16);

    // Mengecek apakah email atau username sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return h
        .response({
          status: 'fail',
          message: 'Username atau email sudah digunakan',
        })
        .code(409);
    }

    // Mengenkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat objek data pengguna
    const userData = {
      id: userId,
      email,
      username,
      password: hashedPassword,
      fullName,
      address: address || null, // Default to null if not provided
      ktp: ktp || null,
    };

    // Membuat pengguna baru di database
    const newUser = await prisma.user.create({
      data: userData,
    });

    // Mengecek apakah pengguna berhasil ditambahkan
    const isSuccess = await prisma.user.findUnique({
      where: { id: newUser.id },
    });

    if (isSuccess) {
      return h
        .response({
          status: 'success',
          message: 'Pengguna berhasil didaftarkan',
          data: {
            userId: newUser.id,
          },
        })
        .code(201);
    }

    // Respons jika terjadi kesalahan saat penyimpanan
    return h
      .response({
        status: 'fail',
        message: 'Pengguna gagal didaftarkan',
      })
      .code(500);
  } catch (error) {
    console.error('Error in registerHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

// POST /users/auth/login
const loginHandler = async (request, h) => {
  const { email, password } = request.payload; // Gunakan `email` dan `password` saja

  try {
    // Mencari pengguna berdasarkan `email`
    const user = await prisma.user.findUnique({
      where: { email }, // Menggunakan `findUnique` untuk mencari berdasarkan email saja
    });

    // Jika pengguna tidak ditemukan
    if (!user) {
      return h
        .response({
          status: 'fail',
          message: 'Pengguna tidak ditemukan',
        })
        .code(404);
    }

    // Memeriksa kecocokan password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return h
        .response({
          status: 'fail',
          message: 'Password salah',
        })
        .code(401);
    }

    // Menghasilkan token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET, // simpan secret key ini di file .env
      { expiresIn: '1h' } // token kedaluwarsa dalam 1 jam
    );

    // Respons sukses dengan token
    return h
      .response({
        status: 'success',
        message: 'Login berhasil',
        data: {
          token, // mengirim token ke klien
        },
      })
      .code(200);
  } catch (error) {
    console.error('Error in loginHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

// POST /users/auth/logout
const logoutHandler = async (request, h) => {
  return h
    .response({
      status: 'success',
      message: 'Logout berhasil',
    })
    .code(200);
};

module.exports = {
  registerHandler,
  loginHandler,
  logoutHandler,
  verifyToken,
};
