const RegionDetail = require('../models/regionDetail.model'); // Adjust path as needed
const { ResponseHandler } = require('../utils/responseHandler');

const checkAndCreateRegion = async (req, res) => {
    try {
        const { regionName, city, state } = req.body;

        // Validate request body
        if (!regionName || !city || !state) {
            return ResponseHandler(res, 400, 'All fields (regionName, city, state) are required');
        }

        // Check if the region already exists in the database
        const existingRegion = await RegionDetail.findOne({ region_name: regionName });

        if (existingRegion) {
            console.log('Region found in database:', regionName);

            // Format response for existing region
            const formattedData = {
                regionName: existingRegion.region_name,
                city: existingRegion.city,
                state: existingRegion.state,
                valid_count: existingRegion.valid_count,
                invalid_count: existingRegion.invalid_count,
                total_count: existingRegion.total_count,
                registered_numbers: existingRegion.registered_numbers,
                ppm_values: existingRegion.ppm_values,
            };

            return ResponseHandler(res, 200, 'Region fetched from database', formattedData);
        }

        console.log('Region not found in database, creating new region:', regionName);

        // Create a new region
        const newRegion = new RegionDetail({
            region_name: regionName,
            city,
            state,
        });

        await newRegion.save();

        // Format response for newly created region
        const formattedData = {
            regionName: newRegion.region_name,
            city: newRegion.city,
            state: newRegion.state,
            valid_count: newRegion.valid_count,
            invalid_count: newRegion.invalid_count,
            total_count: newRegion.total_count,
            registered_numbers: newRegion.registered_numbers,
            ppm_values: newRegion.ppm_values,
        };

        return ResponseHandler(res, 201, 'Region created successfully', formattedData);
    } catch (error) {
        console.error('Error:', error);
        return ResponseHandler(res, 500, 'Error Occurred', { error: error.message });
    }
};

module.exports = {
    checkAndCreateRegion,
};
