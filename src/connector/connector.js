require('dotenv').config();

const { Storage } = require('@google-cloud/storage');
const { Connector } = require('@google-cloud/cloud-sql-connector');

const connector = new Connector();

/**
 * Authenticate with Google Cloud using ADC and list storage buckets.
 * Make sure ADC is set up and has the necessary permissions.
 */
async function authenticateImplicitWithAdc() {
  try {
    const storage = new Storage({
      projectId: process.env.PROJECT_ID,
    });
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
 * Generate the database URL for Prisma using Cloud SQL Connector.
 */
async function getPrismaDbUrl() {
  try {
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

module.exports = {
  authenticateImplicitWithAdc,
  getPrismaDbUrl,
};
