// Controller ini menangani logika terkait reward.
const RewardModel = require('../models/rewardModel'); // Menggunakan RewardModel
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler'); // Menggunakan handleClientError

const getRewardsHandler = async (request, h) => {
  try {
    const rewards = await RewardModel.findAllRewards(); // Dapatkan semua reward dari model
    return h
      .response({
        status: 'success',
        message: 'Daftar rewards berhasil diambil',
        data: rewards,
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal mengambil daftar rewards.');
  }
};

const createRewardHandler = async (request, h) => {
  const { title, description, redeemPoint } = request.payload; // Data reward dari payload

  try {
    // Buat reward baru menggunakan model
    const newReward = await RewardModel.createReward({
      title,
      description,
      redeemPoint,
    });

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil ditambahkan.',
        data: newReward,
      })
      .code(201);
  } catch (error) {
    return handleServerError(h, error, 'Gagal menambahkan reward.');
  }
};

const updateRewardHandler = async (request, h) => {
  const { rewardId } = request.params; // ID reward dari parameter URL
  const { title, description, redeemPoint } = request.payload; // Data update dari payload

  try {
    // Periksa apakah reward ada sebelum mencoba memperbarui
    const existingReward = await RewardModel.findRewardById(rewardId);
    if (!existingReward) {
      return handleClientError(h, 'Reward tidak ditemukan.', 404); // Menggunakan handleClientError
    }

    // Perbarui reward menggunakan model
    const updatedReward = await RewardModel.updateReward(rewardId, {
      title,
      description,
      redeemPoint,
    });

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil diperbarui.',
        data: updatedReward,
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal memperbarui reward.');
  }
};

const deleteRewardHandler = async (request, h) => {
  const { rewardId } = request.params; // ID reward dari parameter URL

  try {
    // Periksa apakah reward ada sebelum mencoba menghapus
    const existingReward = await RewardModel.findRewardById(rewardId);
    if (!existingReward) {
      return handleClientError(h, 'Reward tidak ditemukan.', 404); // Menggunakan handleClientError
    }

    // Hapus reward menggunakan model
    await RewardModel.deleteReward(rewardId);

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil dihapus.',
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal menghapus reward.');
  }
};

module.exports = {
  getRewardsHandler,
  createRewardHandler,
  updateRewardHandler,
  deleteRewardHandler,
};
