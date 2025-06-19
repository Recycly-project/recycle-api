// Model entitas Reward

const prisma = require('../database/prisma');

const RewardModel = {
  /**
   * Mendapatkan semua reward.
   * @returns {Promise<Array<Object>>}
   */
  async findAllRewards() {
    return await prisma.reward.findMany();
  },

  /**
   * Mencari reward by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findRewardById(id) {
    return await prisma.reward.findUnique({ where: { id } });
  },

  /**
   * Membuat reward baru.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createReward(data) {
    return await prisma.reward.create({ data });
  },

  /**
   * Memperbarui reward by ID.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async updateReward(id, data) {
    return await prisma.reward.update({
      where: { id },
      data,
    });
  },

  /**
   * Menghapus reward by ID (beserta entri redeem terkait).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteReward(id) {
    await prisma.redeem.deleteMany({ where: { rewardId: id } });
    return await prisma.reward.delete({ where: { id } });
  },
};

module.exports = RewardModel;
