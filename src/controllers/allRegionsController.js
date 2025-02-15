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
        
        res.json(regions);
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: 'Failed to fetch regions' });
    }
};

module.exports = {
    getAllRegions
};