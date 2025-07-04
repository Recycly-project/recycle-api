// Controller penukaran reward (redeem)

const RedeemModel = require('../models/redeemModel');
const UserModel = require('../models/userModel');
const RewardModel = require('../models/rewardModel');
const prisma = require('../database/prisma');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

// Handler redeem reward
const redeemRewardHandler = async (request, h) => {
  const { id: userId, rewardId } = request.params;

  try {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      console.warn(`[404] User not found: ${userId}`);
      return handleClientError(h, 'Pengguna tidak ditemukan.', 404);
    }

    const reward = await RewardModel.findRewardById(rewardId);
    if (!reward) {
      console.warn(`[404] Reward not found: ${rewardId}`);
      return handleClientError(h, 'Reward tidak ditemukan.', 404);
    }

    if (user.totalPoints < reward.redeemPoint) {
      console.info(
        `[400] Insufficient points: user ${userId} has ${user.totalPoints}, needs ${reward.redeemPoint}`
      );
      return handleClientError(
        h,
        'Poin Anda tidak mencukupi untuk menukarkan reward ini.',
        400
      );
    }

    // Transaksi atomik: kurangi poin + buat entri redeem
    await prisma.$transaction(async (tx) => {
      await UserModel.decrementUserPoints(userId, reward.redeemPoint, tx);
      await RedeemModel.createRedeem(
        {
          userId,
          rewardId,
          status: true,
          pointsUsed: reward.redeemPoint,
        },
        tx
      );
    });

    console.log(`[201] Reward redeemed: user ${userId}, reward ${rewardId}`);
    return h
      .response({
        status: 'success',
        message: 'Reward berhasil ditukarkan.',
      })
      .code(201);
  } catch (error) {
    console.error('[500] Gagal menukarkan reward:', error);
    return handleServerError(h, error, 'Gagal menukarkan reward.');
  }
};

// Handler riwayat redeem
const getRedeemHistoryHandler = async (request, h) => {
  const { userId } = request.auth;

  try {
    const redeems = await RedeemModel.getUserRedeemHistory(userId);

    console.log(`[200] Fetched redeem history for user ${userId}`);
    return h
      .response({
        status: 'success',
        message: 'Riwayat penukaran berhasil diambil.',
        data: redeems,
      })
      .code(200);
  } catch (error) {
    console.error('[500] Gagal mengambil riwayat penukaran:', error);
    return handleServerError(h, error, 'Gagal mengambil riwayat penukaran.');
  }
};

module.exports = {
  redeemRewardHandler,
  getRedeemHistoryHandler,
};
