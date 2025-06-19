// Inisialisasi server, koneksi database, dan rute

require('dotenv').config(); // Memuat variabel .env

const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const { getPrismaDbUrl, port, host } = require('./config');

// Fungsi inisialisasi server
const init = async () => {
  try {
    // Ambil URL database
    const dbUrl = await getPrismaDbUrl();
    if (!dbUrl) {
      throw new Error('Failed to retrieve DATABASE_URL. Please check .env.');
    }

    // Setup server Hapi
    const server = Hapi.server({
      port,
      host,
      routes: {
        cors: {
          origin: ['*'], // CORS diizinkan semua (atur ulang untuk production)
        },
      },
    });

    // Register rute
    server.route(routes);

    // Start server
    await server.start();
    console.log(`Server running at ${server.info.uri}`);
  } catch (error) {
    console.error('Server init error:', error.message);
    process.exit(1);
  }
};

// Jalankan server
init();
