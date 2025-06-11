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
    await prisma.$transaction([
      // Langsung pakai prisma di sini untuk transaksi, atau pindahkan ke model jika transaksi lebih kompleks
      UserModel.decrementUserPoints(userId, reward.redeemPoint), // Kurangi poin pengguna via model
      RedeemModel.createRedeem({
        // Buat entri redeem via model
        userId,
        rewardId,
        status: true, // Asumsi penukaran langsung sukses
        pointsUsed: reward.redeemPoint,
      }),
    ]);

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
