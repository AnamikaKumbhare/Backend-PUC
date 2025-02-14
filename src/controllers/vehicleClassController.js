const VehicleDetails = require('../models/vehicleDetails.model');

const getVehicleCounts = async (req, res) => {
    try {
        // Simple aggregation to count by vehicle class
        const vehicleCounts = await VehicleDetails.aggregate([
            {
                $group: {
                    _id: "$vehicle_class_desc",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);


        // Add error checking for empty results
        if (!vehicleCounts || vehicleCounts.length === 0) {
            console.log('No vehicle data found in database');
        }

        return res.status(200).json({
            success: true,
            data: vehicleCounts
        });
    } catch (error) {
        console.error("Error in getVehicleCounts:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Simple test function to verify data exists
const testDBConnection = async () => {
    try {
        const count = await VehicleDetails.countDocuments();
    } catch (error) {
        console.error('Database test failed:', error);
    }
};

// Run test on module load
testDBConnection();

module.exports = {
    getVehicleCounts
};