// Controller reward

const RewardModel = require('../models/rewardModel');
const {
  handleServerError,
  handleClientError,
} = require('../utils/errorHandler');

// Handler ambil daftar reward
const getRewardsHandler = async (request, h) => {
  try {
    const rewards = await RewardModel.findAllRewards();

    return h
      .response({
        status: 'success',
        message: 'Daftar rewards berhasil diambil.',
        data: rewards,
      })
      .code(200);
  } catch (error) {
    return handleServerError(h, error, 'Gagal mengambil daftar rewards.');
  }
};

// Handler tambah reward baru
const createRewardHandler = async (request, h) => {
  const { title, description, redeemPoint } = request.payload;

  try {
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

// Handler update reward
const updateRewardHandler = async (request, h) => {
  const { rewardId } = request.params;
  const { title, description, redeemPoint } = request.payload;

  try {
    const existingReward = await RewardModel.findRewardById(rewardId);
    if (!existingReward) {
      return handleClientError(h, 'Reward tidak ditemukan.', 404);
    }

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

// Handler hapus reward
const deleteRewardHandler = async (request, h) => {
  const { rewardId } = request.params;

  try {
    const existingReward = await RewardModel.findRewardById(rewardId);
    if (!existingReward) {
      return handleClientError(h, 'Reward tidak ditemukan.', 404);
    }

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
