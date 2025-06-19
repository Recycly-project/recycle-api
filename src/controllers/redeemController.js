// Controller ini menangani logika terkait penukaran reward (redeem).
const RedeemModel = require('../models/redeemModel'); // Menggunakan RedeemModel
const UserModel = require('../models/userModel'); // Menggunakan UserModel untuk update poin
const RewardModel = require('../models/rewardModel'); // Menggunakan RewardModel untuk cek reward
const prisma = require('../database/prisma'); // Mengimpor prisma untuk transaksi
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler'); // Menggunakan handleClientError

const redeemRewardHandler = async (request, h) => {
  const { id: userId } = request.params; // ID pengguna dari parameter URL
  const { rewardId } = request.params; // ID reward dari parameter URL

  try {
    const user = await UserModel.findUserById(userId); // Dapatkan info pengguna
    if (!user) {
      return handleClientError(h, 'Pengguna tidak ditemukan.', 404);
    }

    const reward = await RewardModel.findRewardById(rewardId); // Dapatkan info reward
    if (!reward) {
      return handleClientError(h, 'Reward tidak ditemukan.', 404);
    }

    // Cek apakah poin pengguna cukup untuk menukarkan reward
    if (user.totalPoints < reward.redeemPoint) {
      return handleClientError(
        h,
        'Poin Anda tidak mencukupi untuk menukarkan reward ini.',
        400
      );
    }

    // Lakukan transaksi atomik: kurangi poin pengguna dan buat entri redeem
    // Menggunakan prisma.$transaction untuk memastikan kedua operasi berhasil atau gagal bersamaan.
    await prisma.$transaction(async (tx) => {
      [
        // BEST PRACTICE: Serahkan Promises langsung ke $transaction.
        // Pastikan fungsi UserModel.decrementUserPoints sekarang menerima dan menggunakan 'tx'.
        UserModel.decrementUserPoints(
          userId,
          reward.redeemPoint,
          (tx = prisma)
        ), // Mengirimkan prisma client (akan di-rebind oleh $transaction)
        RedeemModel.createRedeem(
          {
            userId,
            rewardId,
            status: true,
            pointsUsed: reward.redeemPoint,
          },
          tx
        ), // Mengirimkan prisma client (akan di-rebind oleh $transaction)
      ];
    });

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil ditukarkan.',
      })
      .code(201);
  } catch (error) {
    return handleServerError(h, error, 'Gagal menukarkan reward.');
  }
};

const getRedeemHistoryHandler = async (request, h) => {
  // userId diambil dari token yang sudah diverifikasi oleh authMiddleware.
  const { userId } = request.auth;

  try {
    // Dapatkan riwayat penukaran pengguna menggunakan model
    const redeems = await RedeemModel.getUserRedeemHistory(userId);

    return h
      .response({
        status: 'success',
        message: 'Riwayat penukaran berhasil diambil.',
        data: redeems,
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal mengambil riwayat penukaran.');
  }
};

module.exports = {
  redeemRewardHandler,
  getRedeemHistoryHandler,
};
