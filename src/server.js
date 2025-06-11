// Entry point utama untuk aplikasi Hapi.js.
// Bertanggung jawab untuk menginisialisasi server, koneksi database, dan memuat rute.

require('dotenv').config(); // Memuat variabel lingkungan dari file .env

const Hapi = require('@hapi/hapi');
const routes = require('./routes'); // Mengimpor semua rute dari src/routes/index.js
// Mengimpor getPrismaDbUrl, port, dan host dari file config yang baru
const { getPrismaDbUrl, port, host } = require('./config');

// Fungsi asinkron untuk menginisialisasi dan memulai server
const init = async () => {
  try {
    // Dapatkan URL database dari konfigurasi lokal
    const dbUrl = await getPrismaDbUrl();
    if (!dbUrl) {
      throw new Error(
        'Failed to retrieve database URL. Please check your .env file.'
      );
    }
    // console.log('Database URL:', dbUrl);

    // Inisialisasi server Hapi
    const server = Hapi.server({
      port: port, // Menggunakan port dari konfigurasi yang digabungkan
      host: host, // Menggunakan host dari konfigurasi yang digabungkan
      routes: {
        cors: {
          origin: ['*'], // Mengizinkan semua origin untuk CORS (sesuaikan di produksi)
          // Contoh untuk origin spesifik: origin: ['http://localhost:8080', 'https://your-frontend.com'],
        },
      },
    });

    // Daftarkan semua rute ke server
    server.route(routes);

    // Mulai server
    await server.start();
    console.log(`Server running on ${server.info.uri}`); // Pesan server berjalan
  } catch (error) {
    console.error('Error during server initialization:', error.message);
    // Keluar dari proses dengan kode error jika inisialisasi gagal
    process.exit(1);
  }
};

// Panggil fungsi inisialisasi server
init();
