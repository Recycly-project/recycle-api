// Controller ini menangani logika bisnis terkait manajemen data pengguna (selain otentikasi).
const UserModel = require('../models/userModel'); // Menggunakan UserModel
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

const getUserByIdHandler = async (request, h) => {
  const { id } = request.params; // Ambil ID pengguna dari parameter URL

  try {
    const user = await UserModel.findUserById(id); // Cari pengguna berdasarkan ID menggunakan model

    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    return h
      .response({
        status: 'success',
        message: 'Data pengguna berhasil diambil',
        data: { user },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal mengambil data pengguna.');
  }
};

const updateUserHandler = async (request, h) => {
  const { id } = request.params; // Ambil ID pengguna dari parameter URL
  const { email, fullName, address, ktp } = request.payload; // Ambil data update dari payload

  try {
    const existingUser = await UserModel.findUserById(id); // Pastikan pengguna ada
    if (!existingUser) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    const updatedUser = await UserModel.updateUser(id, {
      email,
      fullName,
      address,
      ktp,
    }); // Perbarui pengguna menggunakan model

    return h
      .response({
        status: 'success',
        message: 'Profil berhasil diperbarui',
        data: { userId: updatedUser.id, fullName: updatedUser.fullName },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal memperbarui profil pengguna.');
  }
};

const deleteUserHandler = async (request, h) => {
  const { id: userId } = request.params; // Ambil ID pengguna dari parameter URL

  try {
    const user = await UserModel.findUserById(userId); // Pastikan pengguna ada
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    await UserModel.deleteUser(userId); // Hapus pengguna menggunakan model (model akan menangani penghapusan terkait)

    return h
      .response({
        status: 'success',
        message: 'Pengguna berhasil dihapus',
        data: { userId },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal menghapus pengguna.');
  }
};

module.exports = {
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
};
