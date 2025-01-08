// Backend: regionController.js
const Region = require('../models/regionDetail.model');

const getRegionStats = async (req, res) => {
    try {
        const { regionName } = req.params;

        // Input validation
        if (!regionName) {
            return res.status(400).json({
                success: false,
                message: 'Region name is required'
            });
        }

        // Find the region
        const region = await Region.findOne({ 
            region_name: regionName 
        });

        if (!region) {
            return res.status(404).json({
                success: false,
                message: 'Region not found'
            });
        }

        // Calculate unmatched count
        const totalRegistered = region.registered_numbers?.length || 0;
        const unmatched = Math.max(0, totalRegistered - (region.valid_count + region.invalid_count));

        // Format the response
        const stats = {
            region_name: region.region_name,
            state: region.state,
            city: region.city,
            valid_count: region.valid_count || 0,
            invalid_count: region.invalid_count || 0,
            total_count: region.total_count || 0,
            unmatched_count: unmatched,
            registered_vehicles: totalRegistered,
            last_updated: region.updatedAt
        };

        // Send the response
        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error in getRegionStats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getRegionStats
};