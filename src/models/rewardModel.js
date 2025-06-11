// Model ini menangani operasi terkait entitas 'Reward'.
const prisma = require('../database/prisma');

const RewardModel = {
  // Mendapatkan semua reward yang tersedia
  async findAllRewards() {
    return await prisma.reward.findMany();
  },

  // Mencari reward berdasarkan ID
  async findRewardById(id) {
    return await prisma.reward.findUnique({ where: { id } });
  },

  // Membuat reward baru
  async createReward(data) {
    return await prisma.reward.create({ data });
  },

  // Memperbarui reward berdasarkan ID
  async updateReward(id, data) {
    return await prisma.reward.update({
      where: { id },
      data,
    });
  },

  // Menghapus reward berdasarkan ID
  async deleteReward(id) {
    // Hapus data terkait di tabel 'Redeem' terlebih dahulu
    // untuk menjaga integritas referensial.
    await prisma.redeem.deleteMany({ where: { rewardId: id } });
    return await prisma.reward.delete({ where: { id } });
  },
};

module.exports = RewardModel;
