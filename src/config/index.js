// Konfigurasi utama aplikasi & utilitas koneksi

require('dotenv').config(); // Memuat variabel lingkungan dari .env

// Objek konfigurasi global
const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  jwtSecret: process.env.JWT_SECRET,
  mlApiUrl: process.env.ML_API_URL,
  databaseUrl: process.env.DATABASE_URL,
};

/**
 * Mendapatkan URL database untuk Prisma
 * @returns {string} URL database
 * @throws {Error} Jika DATABASE_URL tidak diatur
 */
async function getPrismaDbUrl() {
  try {
    const dbUrl = config.databaseUrl;
    if (!dbUrl) {
      throw new Error(
        'DATABASE_URL is not set. Please check your .env configuration.'
      );
    }
    console.log('Database URL successfully retrieved.');
    return dbUrl;
  } catch (error) {
    console.error('Error getting Prisma database URL:', error.message);
    throw error;
  }
}

/**
 * Placeholder fungsi getBucket (tidak digunakan di local)
 * @param {string} bucketName
 * @returns {null}
 */
function getBucket(bucketName) {
  console.warn(
    `[WARNING] getBucket not implemented for local. Attempted bucket: ${bucketName}`
  );
  return null;
}

/**
 * Placeholder autentikasi Google Cloud (tidak digunakan di local)
 */
async function authenticateImplicitWithAdc() {
  console.log(
    '[INFO] Skipping Google Cloud implicit authentication (local setup).'
  );
}

// Ekspor konfigurasi & utilitas
module.exports = {
  ...config,
  getPrismaDbUrl,
  getBucket,
  authenticateImplicitWithAdc,
};
