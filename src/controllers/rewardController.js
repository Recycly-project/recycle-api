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

    console.log('[200] Rewards fetched successfully');
    return h
      .response({
        status: 'success',
        message: 'Daftar rewards berhasil diambil.',
        data: rewards,
      })
      .code(200);
  } catch (error) {
    console.error('[500] Gagal mengambil daftar rewards:', error);
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

    console.log('[201] Reward created:', newReward.id);
    return h
      .response({
        status: 'success',
        message: 'Reward berhasil ditambahkan.',
        data: newReward,
      })
      .code(201);
  } catch (error) {
    console.error('[500] Gagal menambahkan reward:', error);
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
      console.warn(`[404] Reward not found: ${rewardId}`);
      return handleClientError(h, 'Reward tidak ditemukan.', 404);
    }

    const updatedReward = await RewardModel.updateReward(rewardId, {
      title,
      description,
      redeemPoint,
    });

    console.log(`[200] Reward updated: ${rewardId}`);
    return h
      .response({
        status: 'success',
        message: 'Reward berhasil diperbarui.',
        data: updatedReward,
      })
      .code(200);
  } catch (error) {
    console.error('[500] Gagal memperbarui reward:', error);
    return handleServerError(h, error, 'Gagal memperbarui reward.');
  }
};

// Handler hapus reward
const deleteRewardHandler = async (request, h) => {
  const { rewardId } = request.params;

  try {
    const existingReward = await RewardModel.findRewardById(rewardId);
    if (!existingReward) {
      console.warn(`[404] Reward not found: ${rewardId}`);
      return handleClientError(h, 'Reward tidak ditemukan.', 404);
    }

    await RewardModel.deleteReward(rewardId);
    console.log(`[200] Reward deleted: ${rewardId}`);

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil dihapus.',
      })
      .code(200);
  } catch (error) {
    console.error('[500] Gagal menghapus reward:', error);
    return handleServerError(h, error, 'Gagal menghapus reward.');
  }
};

module.exports = {
  getRewardsHandler,
  createRewardHandler,
  updateRewardHandler,
  deleteRewardHandler,
};
