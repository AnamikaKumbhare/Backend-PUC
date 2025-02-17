const RegionDetail = require('../models/regionDetail.model');

const getAllRegions = async (req, res) => {
    try {
        const regions = await RegionDetail.find({}, {
            region_name: 1,
            state: 1,
            city: 1,
            valid_count: 1,
            invalid_count: 1,
            total_count: 1
        });
        
        // Calculate problem regions based on invalid count percentage
        const problemRegions = regions
            .map(region => ({
                ...region.toObject(),
                invalid_percentage: (region.invalid_count / region.total_count) * 100
            }))
            .sort((a, b) => b.invalid_percentage - a.invalid_percentage)
            .slice(0, 5);

        res.json({
            regions,
            problemRegions
        });
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
};

module.exports = {
    getAllRegions
};