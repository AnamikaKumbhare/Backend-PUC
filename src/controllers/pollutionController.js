const { ResponseHandler } = require('../utils/responseHandler');
const moment = require('moment');
const websocketService = require('../services/webSockets/webSocketService');

// Constants for pollution thresholds (adjust based on your sensor's specifications)
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
 * Convert raw sensor value to estimated PPM
 * Note: This is a simplified conversion - adjust based on your sensor's specifications
 */
const convertToPPM = (rawValue, voltage) => {
    // Example conversion - replace with your sensor's specific formula
    return (rawValue * voltage) / 10;
};

const receivePollutionData = async (req, res) => {
    try {
        const { deviceId, rawValue, voltage, ppm } = req.body;

        // Validate required fields
        if (!deviceId || !rawValue) {
            const error = 'Missing required fields. DeviceId and rawValue are required.';
            websocketService.emitToAllClients('pollution_data_error', { error });
            return ResponseHandler(res, 400, error);
        }

        // Convert string values to numbers and validate
        const numericRawValue = Number(rawValue);
        const numericVoltage = Number(voltage);
        const numericPPM = ppm ? Number(ppm) : convertToPPM(numericRawValue, numericVoltage);

        if (isNaN(numericRawValue) || isNaN(numericVoltage) || isNaN(numericPPM)) {
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

        // Analyze pollution levels
        const airQuality = calculateAirQuality(numericPPM);
        const isAlert = numericPPM > POLLUTION_THRESHOLDS.UNHEALTHY;

        // Add analysis results
        const analysisData = {
            ...pollutionData,
            airQuality,
            alert: isAlert ? {
                level: airQuality,
                message: `High pollution level detected: ${numericPPM.toFixed(2)} PPM`,
                recommendation: isAlert ? 'Consider wearing a mask or staying indoors' : null
            } : null,
            trends: {
                isIncreasing: null,
                percentageChange: null
            }
        };

        // Log the processed data
        // console.log('Processed pollution data:', {
        //     timestamp: analysisData.timestamp,
        //     deviceId: analysisData.deviceId,
        //     ppm: analysisData.ppm,
        //     airQuality: analysisData.airQuality,
        //     alert: analysisData.alert ? 'YES' : 'NO'
        // });

        // Emit the analyzed data via websocket
        websocketService.emitToAllClients('pollution_data_update', analysisData);

        // Here you would typically save the data to your database
        // await PollutionData.create(pollutionData);

        return ResponseHandler(
            res, 
            200, 
            'Pollution data processed successfully',
            analysisData
        );

    } catch (error) {
        console.error('Error processing pollution data:', error);
        // Emit error via websocket
        websocketService.emitToAllClients('pollution_data_error', { 
            error: error.message,
            errorCode: error.code || 'UNKNOWN_ERROR'
        });
        
        return ResponseHandler(res, 500, 'Internal server error', { 
            error: error.message,
            errorCode: error.code || 'UNKNOWN_ERROR'
        });
    }
};

module.exports = {
    receivePollutionData,
    calculateAirQuality,
    POLLUTION_THRESHOLDS
};