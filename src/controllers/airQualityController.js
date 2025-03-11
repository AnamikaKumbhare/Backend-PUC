const axios = require('axios');

/**
 * Get air quality data from Google's Air Quality API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAirQualityData = async (req, res) => {
    const { lat, lng } = req.query;
    
    // Validate request parameters
    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing required parameters (lat, lng)' });
    }
    
    try {
        // Use server-side API key
        const apiKey = process.env.AIR_QUALITY_API_KEY;
        
        if (!apiKey) {
            console.error('Air Quality API key is missing');
            return res.status(500).json({ error: 'Server configuration error: API key missing' });
        }
        
        // Correct Google Air Quality API endpoint
        const apiUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;
        
        console.log(`Attempting to fetch air quality data for coordinates: ${lat}, ${lng}`);
        
        // Make a POST request with location data in the body
        const response = await axios({
            method: 'POST',
            url: apiUrl,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                location: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng)
                }
            }
        });
        
        console.log(`Google Air Quality API responded with status: ${response.status}`);
        
        // Return the air quality data
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching air quality data:', error.message);
        console.error('Error details:', error);
        
        if (error.response) {
            return res.status(error.response.status).json({ 
                error: error.response.data.error?.message || 'Air Quality API error',
                details: error.response.data,
                status: error.response.status
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch air quality data',
            message: error.message
        });
    }
};

module.exports = {
    getAirQualityData
};
