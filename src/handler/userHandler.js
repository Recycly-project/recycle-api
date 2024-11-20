const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('./authHandler');

// GET: Mendapatkan data pengguna berdasarkan ID
const getUserByIdHandler = async (request, h) => {
  const { id } = request.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        fullName: true,
        address: true,
        ktp: true,
        totalPoints: true,
      },
    });

    if (!user) {
      return h
        .response({ status: 'fail', message: 'Pengguna tidak ditemukan' })
        .code(404);
    }

    return h.response({ status: 'success', data: { user } }).code(200);
  } catch (error) {
    console.error('Error in getUserByIdHandler:', error);
    return h.response({ status: 'error', message: 'Server error' }).code(500);
  }
};

// PUT: Memperbarui profil pengguna
const updateUserHandler = async (request, h) => {
  const { id } = request.params;
  const { email, fullName, address, ktp } = request.payload;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { email, fullName, address, ktp },
    });

    return h.response({
      status: 'success',
      message: 'Profil berhasil diperbarui',
      data: { userId: updatedUser.id },
    });
  } catch (error) {
    console.error('Error in updateUserHandler:', error);
    return h.response({ status: 'error', message: 'Server error' }).code(500);
  }
};

// DELETE: Menghapus profil pengguna
const deleteUserHandler = async (request, h) => {
  const { id: userId } = request.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return h
        .response({ status: 'fail', message: 'Pengguna tidak ditemukan' })
        .code(404);
    }

    await prisma.wasteCollection.deleteMany({ where: { userId } });

    await prisma.user.delete({ where: { id: userId } });

    return h
      .response({ status: 'success', message: 'Pengguna berhasil dihapus' })
      .code(200);
  } catch (error) {
    console.error('Error in deleteUserHandler:', error);
    return h.response({ status: 'error', message: 'Server error' }).code(500);
  }
};

module.exports = {
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
  verifyToken,
};
