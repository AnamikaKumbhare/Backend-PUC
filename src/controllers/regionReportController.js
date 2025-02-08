const RegionDetail = require('../models/regionDetail.model');
const VehicleDetails = require('../models/vehicleDetails.model');

const getRegionVehicles = async (req, res) => {
    try {
        if (!req.params.regionName) {
            return res.status(400).json({
                success: false,
                message: 'Region name is required'
            });
        }

        // Find the region and its registered numbers
        const region = await RegionDetail.findOne({ 
            region_name: req.params.regionName 
        });

        if (!region) {
            return res.status(404).json({ 
                success: false, 
                message: 'Region not found' 
            });
        }

        // Get vehicle details for all registered numbers in this region
        const vehicles = await VehicleDetails.find({
            reg_no: { $in: region.registered_numbers }
        });

        // Format the response
        const formattedVehicles = vehicles.map(vehicle => ({
            owner_name: vehicle.owner_name,
            model: vehicle.model,
            reg_no: vehicle.reg_no,
            state: vehicle.state,
            reg_type_descr: vehicle.reg_type_descr,
            vehicle_class_desc: vehicle.vehicle_class_desc,
            reg_upto: vehicle.reg_upto,
            vehicle_pucc_details: vehicle.vehicle_pucc_details
        }));

        return res.status(200).json({
            success: true,
            response: formattedVehicles
        });

    } catch (error) {
        console.error('Error fetching region vehicles:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching vehicle details',
            error: error.message 
        });
    }
};

module.exports = {
    getRegionVehicles
};