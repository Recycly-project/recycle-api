const prisma = require('../database/prisma');

const UserModel = {
  // Mencari pengguna berdasarkan email
  async findUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  },

  // Mencari pengguna berdasarkan ID, hanya mengembalikan kolom yang relevan
  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        address: true,
        ktp: true, // ktp akan menjadi buffer (BYTEA)
        totalPoints: true,
        isAdmin: true,
      },
    });
  },

  // Membuat pengguna baru
  async createUser(userData) {
    return await prisma.user.create({ data: userData });
  },

  // Memperbarui data pengguna berdasarkan ID
  async updateUser(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData,
    });
  },

  // Menghapus pengguna berdasarkan ID dan semua data terkaitnya
  async deleteUser(id) {
    // Penting: Hapus data terkait di tabel lain yang memiliki foreign key ke 'User'
    // untuk menghindari error constraint violation.
    await prisma.redeem.deleteMany({ where: { userId: id } });
    await prisma.wasteCollection.deleteMany({ where: { userId: id } });
    return await prisma.user.delete({ where: { id } });
  },

  // Mendapatkan semua pengguna (biasanya untuk admin)
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        totalPoints: true,
        isAdmin: true,
      },
    });
  },

  // Menambahkan poin ke totalPoints pengguna
  async incrementUserPoints(userId, points, tx = prisma) {
    return await tx.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
      },
    });
  },

  // Mengurangi poin dari totalPoints pengguna
  async decrementUserPoints(userId, points) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { decrement: points },
      },
    });
  },
};

module.exports = UserModel;
