// src/config/index.js
// File ini berfungsi sebagai pusat konfigurasi aplikasi dan utilitas terkait koneksi.

require('dotenv').config(); // Memuat variabel lingkungan dari file .env

// Objek konfigurasi global aplikasi
const config = {
  // Server configuration
  port: process.env.PORT || 3000, // Port aplikasi, default 3000
  host: process.env.HOST || 'localhost', // Host aplikasi, default localhost

  // Authentication secret (digunakan untuk JWT)
  jwtSecret: process.env.JWT_SECRET,

  // URL API Machine Learning
  mlApiUrl: process.env.ML_API_URL,

  // Database URL (diambil langsung dari variabel lingkungan)
  databaseUrl: process.env.DATABASE_URL,
};

/**
 * Fungsi untuk mendapatkan URL database Prisma.
 * Dalam mode lokal, ini membaca langsung dari DATABASE_URL di objek config.
 * @returns {string} URL database
 * @throws {Error} Jika DATABASE_URL tidak diatur
 */
async function getPrismaDbUrl() {
  try {
    const dbUrl = config.databaseUrl; // Menggunakan databaseUrl dari objek config
    if (!dbUrl) {
      throw new Error(
        'DATABASE_URL is not set in environment variables. Please ensure your .env file is configured correctly for local database.'
      );
    }
    console.log(
      'Database URL successfully retrieved from environment for local use.'
    );
    return dbUrl;
  } catch (error) {
    console.error(
      'Error getting Prisma database URL for local environment:',
      error.message
    );
    throw error;
  }
}

/**
 * Fungsi placeholder untuk getBucket (sebelumnya di connector.js).
 * Karena Google Cloud Storage tidak digunakan secara lokal, fungsi ini tidak diimplementasikan.
 * Disertakan untuk kompatibilitas jika masih ada referensi di kode lain.
 * @param {string} bucketName - Nama bucket yang coba diakses
 * @returns {null} Selalu mengembalikan null di setup lokal
 */
function getBucket(bucketName) {
  console.warn(
    `[WARNING] getBucket function is not implemented for local setup. Attempted to access bucket: ${bucketName}`
  );
  return null;
}

/**
 * Fungsi placeholder untuk autentikasi implisit ADC (sebelumnya di connector.js).
 * Karena Google Cloud Authentication tidak diperlukan untuk setup lokal, fungsi ini tidak diimplementasikan.
 * Disertakan untuk kompatibilitas jika masih ada referensi di kode lain.
 */
async function authenticateImplicitWithAdc() {
  console.log(
    '[INFO] Google Cloud Storage implicit authentication skipped as using local setup.'
  );
  return;
}

// Mengekspor semua properti dari objek config, serta fungsi-fungsi utilitas
module.exports = {
  ...config, // Mengekspor port, host, jwtSecret, mlApiUrl, databaseUrl
  getPrismaDbUrl,
  getBucket,
  authenticateImplicitWithAdc,
};
