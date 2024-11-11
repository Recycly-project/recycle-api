const Hapi = require('@hapi/hapi');
const routes = require('./routes/routes.js')


const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: {
                origin: [ '*' ],
            }
        }
    });

    server.route(routes)
    
    await server.start();
    console.log(`running on`, server.info.uri);
}

init();