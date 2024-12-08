const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('./authHandler');

// Handler mendapatkan daftar rewards
const getRewardsHandler = async (request, h) => {
  try {
    const rewards = await prisma.reward.findMany();
    return h
      .response({
        status: 'success',
        message: 'Daftar rewards berhasil diambil',
        data: rewards,
      })
      .code(200);
  } catch (error) {
    console.error('Error in getRewardsHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Gagal mengambil daftar rewards. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler menambahkan reward (Admin only)
const createRewardHandler = async (request, h) => {
  const { title, description, redeemPoint } = request.payload;

  try {
    const newReward = await prisma.reward.create({
      data: { title, description, redeemPoint },
    });

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil ditambahkan.',
        data: newReward,
      })
      .code(201);
  } catch (error) {
    console.error('Error in createRewardHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Gagal menambahkan reward. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler mengupdate reward (Admin only)
const updateRewardHandler = async (request, h) => {
  const { rewardId } = request.params;
  const { title, description, redeemPoint } = request.payload;

  try {
    const updatedReward = await prisma.reward.update({
      where: { id: rewardId },
      data: { title, description, redeemPoint },
    });

    return h
      .response({
        status: 'success',
        message: 'Reward berhasil diperbarui.',
        data: updatedReward,
      })
      .code(200);
  } catch (error) {
    console.error('Error in updateRewardHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Gagal memperbarui reward. Silakan coba lagi.',
      })
      .code(500);
  }
};

// Handler menghapus reward (Admin only)
const deleteRewardHandler = async (request, h) => {
  const { rewardId } = request.params;

  try {
    await prisma.reward.delete({ where: { id: rewardId } });
    return h
      .response({
        status: 'success',
        message: 'Reward berhasil dihapus.',
      })
      .code(200);
  } catch (error) {
    console.error('Error in deleteRewardHandler:', error.message);
    return h
      .response({
        status: 'error',
        message: 'Gagal menghapus reward. Silakan coba lagi.',
      })
      .code(500);
  }
};

module.exports = {
  getRewardsHandler,
  createRewardHandler,
  updateRewardHandler,
  deleteRewardHandler,
  verifyToken,
};
