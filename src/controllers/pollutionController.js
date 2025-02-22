const { ResponseHandler } = require('../utils/responseHandler');
const moment = require('moment');
const websocketService = require('../services/webSockets/webSocketService');

// Constants for pollution thresholds
const POLLUTION_THRESHOLDS = {
    GOOD: 50,
    MODERATE: 100,
    UNHEALTHY_SENSITIVE: 150,
    UNHEALTHY: 200,
    VERY_UNHEALTHY: 300,
    HAZARDOUS: 500
};

/**
 * Calculate Air Quality Index (AQI) based on sensor PPM values
 * @param {number} ppm - Parts per million reading
 * @returns {string} - Air quality category
 */
const calculateAirQuality = (ppm) => {
    if (ppm <= POLLUTION_THRESHOLDS.GOOD) return 'Good';
    if (ppm <= POLLUTION_THRESHOLDS.MODERATE) return 'Moderate';
    if (ppm <= POLLUTION_THRESHOLDS.UNHEALTHY_SENSITIVE) return 'Unhealthy for Sensitive Groups';
    if (ppm <= POLLUTION_THRESHOLDS.UNHEALTHY) return 'Unhealthy';
    if (ppm <= POLLUTION_THRESHOLDS.VERY_UNHEALTHY) return 'Very Unhealthy';
    return 'Hazardous';
};

/**
 * Handle incoming pollution data from ESP8266 sensors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const receivePollutionData = async (req, res) => {
    try {
        // Extract data from form-urlencoded format
        const { deviceId, ppm, voltage, raw } = req.body;

        // Validate required fields
        if (!deviceId || !raw) {
            const error = 'Missing required fields. DeviceId and raw value are required.';
            websocketService.emitToAllClients('pollution_data_error', { error });
            return ResponseHandler(res, 400, error);
        }

        // Convert string values to numbers and validate
        const numericPPM = Number(ppm);
        const numericVoltage = Number(voltage);
        const numericRawValue = Number(raw);

        if (isNaN(numericPPM) || isNaN(numericVoltage) || isNaN(numericRawValue)) {
            const error = 'Invalid numeric values provided';
            websocketService.emitToAllClients('pollution_data_error', { error });
            return ResponseHandler(res, 400, error);
        }

        // Format the data
        const pollutionData = {
            deviceId,
            rawValue: numericRawValue,
            voltage: numericVoltage,
            ppm: numericPPM,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            location: req.body.location || 'Unknown',
        };

        // Calculate air quality and determine if alert is needed
        const airQuality = calculateAirQuality(numericPPM);
        const isAlert = numericPPM > POLLUTION_THRESHOLDS.UNHEALTHY;

        // Add analysis results
        const analysisData = {
            ...pollutionData,
            airQuality,
            alert: isAlert ? {
                level: airQuality,
                message: `High pollution level detected: ${numericPPM.toFixed(2)} PPM`,
                recommendation: 'Consider wearing a mask or staying indoors'
            } : null
        };

        // Log the processed data
        console.log('Processed pollution data:', {
            timestamp: analysisData.timestamp,
            deviceId: analysisData.deviceId,
            ppm: analysisData.ppm,
            airQuality: analysisData.airQuality,
            alert: analysisData.alert ? 'YES' : 'NO'
        });

        // Emit the analyzed data via websocket
        websocketService.emitToAllClients('pollution_data_update', analysisData);

        // Here you would typically save the data to your database
        // await PollutionData.create(pollutionData);

        // Send success response back to the ESP8266
        return ResponseHandler(
            res, 
            200, 
            'OK', // Simple response for embedded device
            { success: true }
        );

    } catch (error) {
        console.error('Error processing pollution data:', error);
        
        // Emit error via websocket
        websocketService.emitToAllClients('pollution_data_error', { 
            error: error.message,
            errorCode: error.code || 'UNKNOWN_ERROR'
        });
        
        // Send simple error response back to ESP8266
        return ResponseHandler(res, 500, 'Error', { 
            success: false
        });
    }
};

module.exports = {
    receivePollutionData,
    calculateAirQuality,
    POLLUTION_THRESHOLDS
};