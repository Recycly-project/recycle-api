// Model entitas Redeem

const prisma = require('../database/prisma');

const RedeemModel = {
  /**
   * Membuat entri redeem baru.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createRedeem(data) {
    return await prisma.redeem.create({ data });
  },

  /**
   * Riwayat redeem user.
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  async getUserRedeemHistory(userId) {
    return await prisma.redeem.findMany({
      where: { userId },
      include: { reward: true },
    });
  },
};

module.exports = RedeemModel;
