const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('./authHandler');

// Handler menukarkan reward
const redeemRewardHandler = async (request, h) => {
  const { id: userId } = request.params;
  const { rewardId } = request.params;

  try {
    // Validasi user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return h
        .response({
          status: 'fail',
          message: 'Pengguna tidak ditemukan.',
        })
        .code(404);
    }

    // Validasi reward
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) {
      return h
        .response({
          status: 'fail',
          message: 'Reward tidak ditemukan.',
        })
        .code(404);
    }

    // Validasi poin cukup
    if (user.totalPoints < reward.redeemPoint) {
      return h
        .response({
          status: 'fail',
          message: 'Poin Anda tidak mencukupi untuk menukarkan reward ini.',
        })
        .code(400);
    }

    // Proses transaksi penukaran reward
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { totalPoints: user.totalPoints - reward.redeemPoint },
      }),
      prisma.redeem.create({
        data: {
          userId,
          rewardId,
          status: true,
          pointsUsed: reward.redeemPoint,
        },
      }),
    ]);

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil ditukarkan.',
      })
      .code(201);
  } catch (error) {
    console.error('Error in redeemRewardHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Gagal menukarkan reward. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler melihat riwayat redeem
const getRedeemHistoryHandler = async (request, h) => {
  const { userId } = request.auth;

  try {
    const redeems = await prisma.redeem.findMany({
      where: { userId },
      include: { reward: true },
    });

    return h
      .response({
        status: 'success',
        message: 'Riwayat penukaran berhasil diambil.',
        data: redeems,
      })
      .code(200);
  } catch (error) {
    console.error('Error in getRedeemHistoryHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Gagal mengambil riwayat penukaran. Silakan coba lagi.',
      })
      .code(500);
  }
};

module.exports = {
  redeemRewardHandler,
  getRedeemHistoryHandler,
  verifyToken,
};
