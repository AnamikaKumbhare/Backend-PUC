const { app, server, config,io } = require('./src/app');
const websocketService = require('./src/services/webSockets/webSocketService');
websocketService.initialize(io);

server.listen(config.PORT, config.HOST, () => {
    console.log(`Server running in ${config.ENV} mode on http://${config.HOST}:${config.PORT}`);
});
