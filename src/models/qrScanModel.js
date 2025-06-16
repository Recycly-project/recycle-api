const prisma = require('../database/prisma');

const QrScanModel = {
  /**
   * Membuat entri baru untuk pemindaian QR code.
   * @param {Object} data - Data pemindaian QR code.
   * @param {Object} [tx=prisma] - Instance PrismaClient atau transaksi (opsional, default ke prisma global).
   * @returns {Promise<Object>} Entri QrScan yang baru dibuat.
   */
  async createQrScanEntry(data, tx = prisma) {
    return await tx.qrScan.create({ data });
  },

  /**
   * Mencari entri QrScan berdasarkan ID unik QR code (dari payload QR).
   * @param {string} qrCodeId - ID unik QR code yang terkandung dalam QR itu sendiri.
   * @returns {Promise<Object|null>} Entri QrScan jika ditemukan, null jika tidak.
   */
  async findQrScanByQrCodeId(qrCodeId) {
    return await prisma.qrScan.findUnique({ where: { qrCodeId } });
  },

  /**
   * Memperbarui status penggunaan QR code.
   * @param {string} id - ID internal entri QrScan di database (bukan qrCodeId dari payload QR).
   * @param {boolean} isUsed - Status penggunaan baru.
   * @param {Object} [tx=prisma] - Instance PrismaClient atau transaksi (opsional, default ke prisma global).
   * @returns {Promise<Object>} Entri QrScan yang diperbarui.
   */
  async updateQrScanStatus(id, isUsed, tx = prisma) {
    return await tx.qrScan.update({
      where: { id },
      data: { isUsed },
    });
  },

  /**
   * Mendapatkan riwayat pemindaian QR code untuk pengguna tertentu.
   * @param {string} userId - ID pengguna.
   * @returns {Promise<Array<Object>>} Daftar riwayat pemindaian QR code.
   */
  async getUserQrScanHistory(userId) {
    return await prisma.qrScan.findMany({
      where: { userId },
      orderBy: { scannedAt: 'desc' },
    });
  },
};

module.exports = QrScanModel;
