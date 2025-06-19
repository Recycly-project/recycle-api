// Controller otentikasi: registrasi, login, update KTP, daftar user, logout

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const config = require('../config');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

// Handler registrasi user baru
const registerHandler = async (request, h) => {
  let { email, password, fullName, address, isAdmin } = request.payload;
  const file = request.payload.ktp;

  try {
    if (typeof isAdmin === 'string') {
      isAdmin = isAdmin.toLowerCase() === 'true';
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return handleClientError(h, 'Email sudah digunakan', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const ktpBuffer = file && file._data ? file._data : null;

    const newUser = await UserModel.createUser({
      email,
      password: hashedPassword,
      fullName,
      address,
      ktp: ktpBuffer,
      isAdmin: isAdmin || false,
    });

    return h
      .response({
        status: 'success',
        message: 'Registrasi berhasil',
        data: { userId: newUser.id },
      })
      .code(201);
  } catch (error) {
    return handleServerError(h, error, 'Gagal melakukan registrasi.');
  }
};

// Handler login user
const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  try {
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return handleClientError(h, 'Email atau password salah', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleClientError(h, 'Email atau password salah', 401);
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      config.jwtSecret,
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
    return handleServerError(h, error, 'Gagal melakukan login.');
  }
};

// Handler update KTP
const updateKtpHandler = async (request, h) => {
  const { id } = request.params;
  const file = request.payload.ktp;

  try {
    const existingUser = await UserModel.findUserById(id);
    if (!existingUser) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    if (!file || !file._data) {
      return handleClientError(h, 'File KTP tidak valid', 400);
    }

    await UserModel.updateUser(id, { ktp: file._data });

    return h
      .response({
        status: 'success',
        message: 'KTP berhasil diperbarui',
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal memperbarui KTP.');
  }
};

// Handler ambil semua user
const getAllUsersHandler = async (request, h) => {
  try {
    const users = await UserModel.getAllUsers();

    if (users.length === 0) {
      return handleClientError(h, 'Tidak ada pengguna ditemukan', 404);
    }

    return h
      .response({
        status: 'success',
        message: 'Daftar pengguna berhasil diambil',
        data: { users },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal mengambil daftar pengguna.');
  }
};

// Handler logout (dummy, karena token tetap aktif di client)
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
  updateKtpHandler,
  getAllUsersHandler,
  logoutHandler,
};
