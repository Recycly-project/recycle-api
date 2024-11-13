const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('./authHandler');
const prisma = new PrismaClient();

// GET /users
const getAllUsersHandler = async (request, h) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        address: true,
        ktp: true,
        createdAt: true,
      },
    });

    return h
      .response({
        status: 'success',
        data: {
          users,
        },
      })
      .code(200);
  } catch (error) {
    console.error('Error in getUserByIdHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

// GET /users/{id}
const getUserByIdHandler = async (request, h) => {
  const id = request.params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        address: true,
        ktp: true,
        createdAt: true,
      },
    });

    if (!user) {
      return h
        .response({
          status: 'fail',
          message: 'Pengguna tidak ditemukan',
        })
        .code(404);
    }

    return h
      .response({
        status: 'success',
        data: {
          user,
        },
      })
      .code(200);
  } catch (error) {
    console.error('Error in getUserByIdHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

// PUT /users/{id}
const updateUserHandler = async (request, h) => {
  const id = request.params.id;
  const { email, username, password, fullName, address, ktp } = request.payload;

  try {
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        username,
        password: hashedPassword || undefined,
        fullName,
        address,
        ktp,
      },
    });

    return h
      .response({
        status: 'success',
        message: 'Pengguna berhasil diperbarui',
        data: {
          userId: updatedUser.id,
        },
      })
      .code(200);
  } catch (error) {
    console.error('Error in updateUserHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

// DELETE /users/{id}
const deleteUserHandler = async (request, h) => {
  const id = request.params.id;

  try {
    await prisma.user.delete({
      where: { id },
    });

    return h
      .response({
        status: 'success',
        message: 'Pengguna berhasil dihapus',
      })
      .code(200);
  } catch (error) {
    console.error('Error in deleteUserHandler:', error);
    return h
      .response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      })
      .code(500);
  }
};

module.exports = {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
  verifyToken,
};
