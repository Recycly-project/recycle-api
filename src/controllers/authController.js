// Controller ini menangani logika otentikasi (registrasi, login, dll.).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel'); // Menggunakan UserModel
const config = require('../config');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

const registerHandler = async (request, h) => {
  // Gunakan 'let' untuk isAdmin karena nilainya mungkin akan diubah
  let { email, password, fullName, address, isAdmin } = request.payload;
  const file = request.payload.ktp; // File KTP (jika ada)

  try {
    // Jika isAdmin datang sebagai string (misalnya dari form-data Postman),
    // konversikan menjadi nilai Boolean yang sebenarnya.
    if (typeof isAdmin === 'string') {
      isAdmin = isAdmin.toLowerCase() === 'true';
    }

    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return handleClientError(h, 'Email sudah digunakan', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let ktpBuffer = null;

    if (file && file._data) {
      ktpBuffer = file._data; // Simpan data file sebagai buffer
    }

    const newUser = await UserModel.createUser({
      email,
      password: hashedPassword,
      fullName,
      address,
      ktp: ktpBuffer,
      isAdmin: isAdmin || false, // Default isAdmin false
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

    // Buat token JWT
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      config.jwtSecret, // Kunci rahasia dari konfigurasi
      { expiresIn: '1h' } // Token berlaku 1 jam
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

    // Perbarui kolom ktp dengan data buffer file
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

const getAllUsersHandler = async (request, h) => {
  try {
    // Hanya admin yang bisa mengakses ini (diasumsikan sudah diverifikasi oleh middleware isAdmin)
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

const logoutHandler = async (request, h) => {
  // Untuk JWT sederhana, logout hanya berarti klien membuang token.
  // Tidak ada logika server-side kompleks yang diperlukan di sini kecuali ada blacklist token.
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
};
