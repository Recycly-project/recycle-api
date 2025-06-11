// Model ini menangani operasi terkait entitas 'Redeem'.
const prisma = require('../database/prisma');

const RedeemModel = {
  // Membuat entri penukaran reward baru
  async createRedeem(data) {
    return await prisma.redeem.create({ data });
  },

  // Mendapatkan riwayat penukaran (redeem) untuk pengguna tertentu
  async getUserRedeemHistory(userId) {
    return await prisma.redeem.findMany({
      where: { userId },
      include: { reward: true }, // Sertakan detail reward yang ditukarkan
    });
  },
};

module.exports = RedeemModel;
