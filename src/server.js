require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('./routes/routes');
const { getPrismaDbUrl } = require('./connector/connector');

const init = async () => {
  try {
    // Ambil URL Database
    const dbUrl = await getPrismaDbUrl();
    if (!dbUrl) {
      throw new Error('Failed to generate database URL.');
    }
    console.log('Database URL:', dbUrl);

    // Inisialisasi server
    const server = Hapi.server({
      port: process.env.PORT || 3000,
      host: process.env.HOST,
      routes: {
        cors: {
          origin: ['*'],
        },
      },
    });

    // Tambahkan route
    server.route(routes);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
  } catch (error) {
    console.error('Error during server initialization:', error.message);
    process.exit(1); // Keluar dengan kode error
  }
};

init();
