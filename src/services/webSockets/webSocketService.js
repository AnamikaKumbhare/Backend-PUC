// src/services/websocketService.js
let io;

const initialize = (ioInstance) => {
    io = ioInstance;
};

const emitToAllClients = (eventName, data) => {
    if (io) {
        io.emit(eventName, data);
    } else {
        console.error('Socket.IO not initialized');
    }
};

const emitPUCValidationResult = (data) => {
    emitToAllClients('puc_validation_result', { data });
};

const emitPUCValidationError = (error) => {
    emitToAllClients('puc_validation_error', { error });
};

module.exports = {
    initialize,
    emitToAllClients,
    emitPUCValidationResult,
    emitPUCValidationError
};