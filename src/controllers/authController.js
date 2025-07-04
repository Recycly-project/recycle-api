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
      console.warn(`Registrasi gagal - Email sudah digunakan: ${email} [409]`);
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

    console.info(`Registrasi berhasil - User ID: ${newUser.id} [201]`);
    return h
      .response({
        status: 'success',
        message: 'Registrasi berhasil',
        data: { userId: newUser.id },
      })
      .code(201);
  } catch (error) {
    console.error('Registrasi error [500]:', error);
    return handleServerError(h, error, 'Gagal melakukan registrasi.');
  }
};

// Handler login user
const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  try {
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      console.warn(`Login gagal - Email tidak ditemukan: ${email} [401]`);
      return handleClientError(h, 'Email atau password salah', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.warn(`Login gagal - Password tidak cocok untuk ${email} [401]`);
      return handleClientError(h, 'Email atau password salah', 401);
    }

    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    console.info(`Login berhasil - User ID: ${user.id} [200]`);
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
    console.error('Login error [500]:', error);
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
      console.warn(`Update KTP gagal - User tidak ditemukan: ${id} [404]`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    if (!file || !file._data) {
      console.warn(
        `Update KTP gagal - File tidak valid untuk user: ${id} [400]`
      );
      return handleClientError(h, 'File KTP tidak valid', 400);
    }

    await UserModel.updateUser(id, { ktp: file._data });

    console.info(`KTP berhasil diperbarui - User ID: ${id} [200]`);
    return h
      .response({
        status: 'success',
        message: 'KTP berhasil diperbarui',
      })
      .code(200);
  } catch (error) {
    console.error('Update KTP error [500]:', error);
    return handleServerError(h, error, 'Gagal memperbarui KTP.');
  }
};

// Handler ambil semua user
const getAllUsersHandler = async (request, h) => {
  try {
    const users = await UserModel.getAllUsers();

    if (users.length === 0) {
      console.warn('Pengambilan user gagal - Tidak ada data [404]');
      return handleClientError(h, 'Tidak ada pengguna ditemukan', 404);
    }

    console.info(`Berhasil ambil ${users.length} pengguna [200]`);
    return h
      .response({
        status: 'success',
        message: 'Daftar pengguna berhasil diambil',
        data: { users },
      })
      .code(200);
  } catch (error) {
    console.error('Get all users error [500]:', error);
    return handleServerError(h, error, 'Gagal mengambil daftar pengguna.');
  }
};

// Handler logout
const logoutHandler = async (request, h) => {
  console.info('Logout dipanggil (dummy) [200]');
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
