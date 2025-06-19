// Model entitas Scan QR Code

const prisma = require('../database/prisma');

const QrScanModel = {
  /**
   * Membuat entri pemindaian QR code.
   * @param {Object} data
   * @param {Object} [tx=prisma]
   * @returns {Promise<Object>}
   */
  async createQrScanEntry(data, tx = prisma) {
    return await tx.qrScan.create({ data });
  },

  /**
   * Mencari entri QR code berdasarkan qrCodeId.
   * @param {string} qrCodeId
   * @returns {Promise<Object|null>}
   */
  async findQrScanByQrCodeId(qrCodeId) {
    return await prisma.qrScan.findUnique({ where: { qrCodeId } });
  },

  /**
   * Memperbarui status penggunaan QR code.
   * @param {string} id
   * @param {boolean} isUsed
   * @param {Object} [tx=prisma]
   * @returns {Promise<Object>}
   */
  async updateQrScanStatus(id, isUsed, tx = prisma) {
    return await tx.qrScan.update({
      where: { id },
      data: { isUsed },
    });
  },

  /**
   * Riwayat pemindaian QR code user.
   * @param {string} userId
   * @returns {Promise<Array<Object>>}
   */
  async getUserQrScanHistory(userId) {
    return await prisma.qrScan.findMany({
      where: { userId },
      orderBy: { scannedAt: 'desc' },
    });
  },
};

module.exports = QrScanModel;
