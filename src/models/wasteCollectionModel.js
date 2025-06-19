// Model entitas WasteCollection

const prisma = require('../database/prisma');

const WasteCollectionModel = {
  /**
   * Membuat entri waste collection.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createWasteCollection(data) {
    return await prisma.wasteCollection.create({ data });
  },

  /**
   * Ambil koleksi sampah user.
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  async getUserWasteCollections(userId) {
    return await prisma.wasteCollection.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        label: true,
        points: true,
        createdAt: true,
        // 'image' biasanya tidak dikembalikan di API.
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

module.exports = WasteCollectionModel;
