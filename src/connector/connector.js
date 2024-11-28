require('dotenv').config();

const { Storage } = require('@google-cloud/storage');
const { Connector } = require('@google-cloud/cloud-sql-connector');

/**
 * Inisialisasi Google Cloud Storage
 * Pastikan projectId sesuai dengan environment variable
 */
let storage;
try {
  storage = new Storage({
    projectId: process.env.PROJECT_ID,
  });
  console.log('Google Cloud Storage initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Google Cloud Storage:', error.message);
  throw error;
}

/**
 * Inisialisasi Cloud SQL Connector
 */
const connector = new Connector();

/**
 * Fungsi untuk mengautentikasi dan mendapatkan daftar bucket
 * Menggunakan ADC (Application Default Credentials)
 */
async function authenticateImplicitWithAdc() {
  try {
    const [buckets] = await storage.getBuckets();
    console.log('Buckets:');
    for (const bucket of buckets) {
      console.log(`- ${bucket.name}`);
    }
    console.log('Listed all storage buckets successfully.');
  } catch (error) {
    console.error('Error listing storage buckets:', error.message);
    throw error;
  }
}

/**
 * Fungsi untuk menghasilkan URL database Prisma menggunakan Cloud SQL Connector
 */
async function getPrismaDbUrl() {
  try {
    // Konfigurasi koneksi instance
    const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
      ipType: 'PUBLIC', // Ubah ke 'PRIVATE' jika menggunakan private IP
    });

    const dbUrl = `postgresql://${encodeURIComponent(
      process.env.DATABASE_USER
    )}:${encodeURIComponent(process.env.DATABASE_PASSWORD)}@${
      clientOpts.host
    }:${clientOpts.port}/${process.env.DATABASE_NAME}`;

    console.log('Database URL successfully generated:', dbUrl);
    return dbUrl;
  } catch (error) {
    console.error('Error generating Prisma database URL:', error.message);
    throw error;
  }
}

/**
 * Helper untuk mendapatkan bucket dari Storage
 * @param {string} bucketName - Nama bucket yang ingin diakses
 */
function getBucket(bucketName) {
  if (!storage) {
    throw new Error('Google Cloud Storage is not initialized');
  }
  if (!bucketName) {
    throw new Error('Bucket name is not provided');
  }
  return storage.bucket(bucketName);
}

module.exports = {
  storage,
  authenticateImplicitWithAdc,
  getPrismaDbUrl,
  getBucket,
};
