// Controller manajemen data pengguna (non-otentikasi)

const UserModel = require('../models/userModel');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

// Handler ambil data user by ID
const getUserByIdHandler = async (request, h) => {
  const { id } = request.params;

  try {
    const user = await UserModel.findUserById(id);
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    return h
      .response({
        status: 'success',
        message: 'Data pengguna berhasil diambil.',
        data: { user },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal mengambil data pengguna.');
  }
};

// Handler update data user
const updateUserHandler = async (request, h) => {
  const { id } = request.params;
  const { email, fullName, address, ktp } = request.payload;

  try {
    const existingUser = await UserModel.findUserById(id);
    if (!existingUser) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    const updatedUser = await UserModel.updateUser(id, {
      email,
      fullName,
      address,
      ktp,
    });

    return h
      .response({
        status: 'success',
        message: 'Profil berhasil diperbarui.',
        data: { userId: updatedUser.id, fullName: updatedUser.fullName },
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal memperbarui profil pengguna.');
  }
};

// Handler hapus user
const deleteUserHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    await UserModel.deleteUser(userId);

    return h
      .response({
        status: 'success',
        message: 'Pengguna berhasil dihapus.',
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
