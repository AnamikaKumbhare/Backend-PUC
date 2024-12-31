// src/services/websocketService.js

/**
 * Socket.IO instance to emit events to connected clients.
 */
let io;

/**
 * Initializes the Socket.IO instance.
 * @param {Object} ioInstance - The Socket.IO instance to be used for emitting events.
 */
const initialize = (ioInstance) => {
    io = ioInstance;
};

/**
 * Emits an event with data to all connected clients.
 * @param {string} eventName - Name of the event to emit.
 * @param {Object} data - Data to send with the event.
 */
const emitToAllClients = (eventName, data) => {
    if (io) {
        io.emit(eventName, data);
    } else {
        console.error('Socket.IO not initialized');
    }
};

/**
 * Emits a PUC validation result to all connected clients.
 * @param {Object} data - PUC validation result data to emit.
 */
const emitPUCValidationResult = (data) => {
    emitToAllClients('puc_validation_result', { data });
};

/**
 * Emits a PUC validation error to all connected clients.
 * @param {Object} error - Error details to emit.
 */
const emitPUCValidationError = (error) => {
    emitToAllClients('puc_validation_error', { error });
};

// Exporting the functions for use in other modules
module.exports = {
    initialize,
    emitToAllClients,
    emitPUCValidationResult,
    emitPUCValidationError
};
