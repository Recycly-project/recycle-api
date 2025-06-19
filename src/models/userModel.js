// Model entitas User

const prisma = require('../database/prisma');

const UserModel = {
  /**
   * Cari user by email.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  },

  /**
   * Cari user by ID (field relevan saja).
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findUserById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        address: true,
        ktp: true,
        totalPoints: true,
        isAdmin: true,
      },
    });
  },

  /**
   * Membuat user baru.
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async createUser(userData) {
    return await prisma.user.create({ data: userData });
  },

  /**
   * Update user by ID.
   * @param {string} id
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async updateUser(id, userData) {
    return await prisma.user.update({
      where: { id },
      data: userData,
    });
  },

  /**
   * Hapus user beserta data terkait.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteUser(id) {
    await prisma.redeem.deleteMany({ where: { userId: id } });
    await prisma.wasteCollection.deleteMany({ where: { userId: id } });
    return await prisma.user.delete({ where: { id } });
  },

  /**
   * Ambil semua user (admin).
   * @returns {Promise<Array<Object>>}
   */
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

  /**
   * Tambahkan poin ke user.
   * @param {string} userId
   * @param {number} points
   * @param {Object} [tx=prisma]
   * @returns {Promise<Object>}
   */
  async incrementUserPoints(userId, points, tx = prisma) {
    return await tx.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
      },
    });
  },

  /**
   * Kurangi poin user.
   * @param {string} userId
   * @param {number} points
   * @param {Object} [tx=prisma]
   * @returns {Promise<Object>}
   */
  async decrementUserPoints(userId, points, tx = prisma) {
    return await tx.user.update({
      where: { id: userId },
      data: {
        totalPoints: { decrement: points },
      },
    });
  },
};

module.exports = UserModel;
