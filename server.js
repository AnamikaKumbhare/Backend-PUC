const { app, server, config } = require('./src/app');

server.listen(config.PORT, config.HOST, () => {
    console.log(`Server running in ${config.ENV} mode on http://${config.HOST}:${config.PORT}`);
});
