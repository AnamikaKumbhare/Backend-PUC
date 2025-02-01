const { SerialPort } = require('serialport');
const { exec } = require('child_process');
const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');
const os = require('os');
const util = require('util');
const execPromise = util.promisify(exec);
// Utility function to get temporary directory path
async function checkDependencies() {
    try {
        // Check Python
        await execPromise('python --version');
        // Check esptool
        await execPromise('python -m esptool version');
        return true;
    } catch (error) {
        return false;
    }
}

// Function to install esptool if missing
async function installEsptool() {
    try {
        await execPromise('pip install esptool');
        return true;
    } catch (error) {
        throw new Error('Failed to install esptool: ' + error.message);
    }
}

// Modified flash firmware function with correct esptool invocation
async function flashFirmware(portPath, firmwarePath) {
    try {
        // Check dependencies first
        const dependenciesInstalled = await checkDependencies();
        if (!dependenciesInstalled) {
            console.log('Installing required dependencies...');
            await installEsptool();
        }

        // Use python -m esptool instead of direct script path
        const command = `python -m esptool --port ${portPath} --baud 115200 --before default_reset --after hard_reset write_flash 0x0 "${firmwarePath}"`;
        
        console.log('Executing flash command:', command);
        
        // Execute flashing command
        const { stdout, stderr } = await execPromise(command);
        
        console.log('Flash stdout:', stdout);
        console.log('Flash stderr:', stderr);
        
        // Check for common error indicators in output
        if (stderr && !stderr.includes('Connecting')) {
            throw new Error(stderr);
        }
        
        // Check for successful flash indicators
        if (!stdout.includes('Wrote') && !stdout.includes('Successfully')) {
            throw new Error('Flash completed but success indicator not found in output');
        }
        
        return {
            success: true,
            output: stdout
        };
    } catch (error) {
        console.error('Detailed flash error:', error);
        throw new Error(`Flashing failed: ${error.message}`);
    }
}

// Modified download firmware function with additional logging
async function downloadFirmware(url) {
    const tempDir = await initTempDir();
    const firmwarePath = path.join(tempDir, `firmware-${Date.now()}.bin`);
    
    try {
        console.log('Downloading firmware from:', url);
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            validateStatus: status => status === 200
        });

        console.log('Firmware download complete, size:', response.data.length);

        // Validate firmware file size
        if (response.data.length < 1000) {
            throw new Error('Downloaded firmware file appears to be invalid (too small)');
        }

        await fs.writeFile(firmwarePath, response.data);
        console.log('Firmware saved to:', firmwarePath);
        
        return firmwarePath;
    } catch (error) {
        console.error('Download error:', error);
        throw new Error(`Failed to download firmware: ${error.message}`);
    }
}

// Utility function to get temporary directory path
const getTempDir = () => {
    return path.join(os.tmpdir(), 'nodemcu-flash');
};

// Initialize temp directory
const initTempDir = async () => {
    const tempDir = getTempDir();
    try {
        await fs.mkdir(tempDir, { recursive: true });
        console.log('Temp directory initialized:', tempDir);
    } catch (error) {
        console.error('Error creating temp directory:', error);
    }
    return tempDir;
};

// Clean up temporary files
const cleanupTempFiles = async (filepath) => {
    try {
        await fs.unlink(filepath);
        console.log('Cleaned up temp file:', filepath);
    } catch (error) {
        console.error('Error cleaning up temp file:', error);
    }
};

// Modified controller function with enhanced error handling
const handleDeviceFlash = async (req, res) => {
    let firmwarePath = null;
    try {
        const { firmwareUrl, portPath } = req.body;
        
        if (!firmwareUrl || !portPath) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: firmwareUrl and portPath are required'
            });
        }

        console.log('Starting flash process for device on port:', portPath);
        
        firmwarePath = await downloadFirmware(firmwareUrl);
        console.log('Firmware downloaded successfully');

        const flashResult = await flashFirmware(portPath, firmwarePath);
        console.log('Flash completed successfully');

        res.json({
            success: true,
            message: 'Device flashed successfully',
            details: flashResult.output
        });

    } catch (error) {
        console.error('Flashing error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    } finally {
        // Cleanup in finally block to ensure it runs
        if (firmwarePath) {
            await cleanupTempFiles(firmwarePath);
        }
    }
};

const checkDeviceHealth = async (req, res) => {
    try {
        const ports = await SerialPort.list();
        console.log('All detected ports:', ports); // Debug log

        // NodeMCU common USB-to-Serial chips
        const compatibleDevices = [
            { vendorId: '1a86', productId: '7523' }, // CH340
            { vendorId: '10c4', productId: 'ea60' }, // CP2102
            { vendorId: '0403', productId: '6001' }, // FTDI
            { vendorId: '1a86', productId: '55d4' }  // Another CH340 variant
        ];

        const hasESPDevice = ports.some(port => {
            const isCompatible = compatibleDevices.some(device => 
                port.vendorId?.toLowerCase() === device.vendorId && 
                port.productId?.toLowerCase() === device.productId
            );
            
            if (isCompatible) {
                console.log('Found compatible device:', {
                    path: port.path,
                    vendorId: port.vendorId,
                    productId: port.productId,
                    manufacturer: port.manufacturer
                });
            }
            
            return isCompatible;
        });

        // Modified response to include more details
        res.json({
            success: true,
            status: hasESPDevice ? 'Device connected' : 'No device found',
            deviceFound: hasESPDevice,
            availablePorts: ports.map(port => ({
                path: port.path,
                vendorId: port.vendorId,
                productId: port.productId,
                manufacturer: port.manufacturer
            }))
        });

    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            errorDetails: error.stack
        });
    }
};

const listDevicePorts = async (req, res) => {
    try {
        const ports = await SerialPort.list();
        
        // Normalize vendorId and productId to lowercase for consistent comparison
        const espPorts = ports.filter(port => {
            const vendorId = port.vendorId?.toLowerCase();
            const productId = port.productId?.toLowerCase();
            
            return (
                (vendorId === '1a86' && productId === '7523') || // CH340
                (vendorId === '10c4' && productId === 'ea60') || // CP2102
                (vendorId === '0403' && productId === '6001') || // FTDI
                (vendorId === '1a86' && productId === '55d4')    // Another CH340 variant
            );
        });

        // Enhanced response with more port details
        res.json({
            success: true,
            ports: espPorts.map(port => ({
                path: port.path,
                manufacturer: port.manufacturer || 'Unknown',
                serialNumber: port.serialNumber,
                vendorId: port.vendorId,
                productId: port.productId,
                friendlyName: port.friendlyName || port.path
            }))
        });

    } catch (error) {
        console.error('Port listing error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    handleDeviceFlash,
    checkDeviceHealth,
    listDevicePorts
};
