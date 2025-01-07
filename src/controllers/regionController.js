const regionService = require('../services/PUCcheckServices/regionCheckService');
const { ResponseHandler } = require('../utils/responseHandler');

const checkAndCreateRegion = async (req, res) => {
    try {
        const { regionName, city, state } = req.body;

        if (!regionName || !city || !state) {
            return ResponseHandler(res, 400, 'All fields (regionName, city, state) are required');
        }

        const result = await regionService.checkAndCreateRegion({ regionName, city, state });
        
        if (result.status === 'exists') {
            return ResponseHandler(res, 200, 'Region fetched from database', result.data);
        }
        
        return ResponseHandler(res, 201, 'Region created successfully', result.data);
    } catch (error) {
        console.error('Error:', error);
        return ResponseHandler(res, 500, 'Error Occurred', { error: error.message });
    }
};

module.exports = {
    checkAndCreateRegion
};