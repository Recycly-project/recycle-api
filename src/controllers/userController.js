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
      console.warn(`[404] User not found: ${id}`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    console.log(`[200] User fetched successfully: ${id}`);
    return h
      .response({
        status: 'success',
        message: 'Data pengguna berhasil diambil.',
        data: { user },
      })
      .code(200);
  } catch (error) {
    console.error(`[500] Failed to get user: ${id}`, error);
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
      console.warn(`[404] User not found for update: ${id}`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    const updatedUser = await UserModel.updateUser(id, {
      email,
      fullName,
      address,
      ktp,
    });

    console.log(`[200] User updated successfully: ${id}`);
    return h
      .response({
        status: 'success',
        message: 'Profil berhasil diperbarui.',
        data: { userId: updatedUser.id, fullName: updatedUser.fullName },
      })
      .code(200);
  } catch (error) {
    console.error(`[500] Failed to update user: ${id}`, error);
    return handleServerError(h, error, 'Gagal memperbarui profil pengguna.');
  }
};

// Handler hapus user
const deleteUserHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      console.warn(`[404] User not found for deletion: ${userId}`);
      return handleClientError(h, 'Pengguna tidak ditemukan', 404);
    }

    await UserModel.deleteUser(userId);
    console.log(`[200] User deleted successfully: ${userId}`);

    return h
      .response({
        status: 'success',
        message: 'Pengguna berhasil dihapus.',
        data: { userId },
      })
      .code(200);
  } catch (error) {
    console.error(`[500] Failed to delete user: ${userId}`, error);
    return handleServerError(h, error, 'Gagal menghapus pengguna.');
  }
};

module.exports = {
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
};
