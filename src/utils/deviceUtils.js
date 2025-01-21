const SerialPort = require('serialport');

async function findESP8266Port() {
  const ports = await SerialPort.list();
  const espPort = ports.find(
    (port) =>
      port.manufacturer?.includes('Silicon Labs') ||
      port.manufacturer?.includes('QinHeng Electronics') ||
      port.vendorId === '1a86' // Common vendor ID for CH340
  );
  return espPort?.path;
}

async function listAvailablePorts() {
  const ports = await SerialPort.list();
  return ports.map((port) => ({
    path: port.path,
    manufacturer: port.manufacturer,
    vendorId: port.vendorId,
    productId: port.productId,
  }));
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { findESP8266Port, listAvailablePorts, delay };
