const RegionDetail = require('../models/regionDetail.model');

const savePpmData = async (req, res) => {
  try {
    const { region_name, ppm_value } = req.body;
    
    // Validate input
    if (!region_name || typeof ppm_value !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input. region_name and ppm_value are required.',
        error: 'ValidationError'
      });
    }

    // Find the region
    const region = await RegionDetail.findOne({ region_name });
    
    if (!region) {
      return res.status(404).json({
        success: false,
        message: `Region '${region_name}' not found`,
        error: 'NotFoundError'
      });
    }

    // Add new PPM value to the array
    region.ppm_values.push({
      value: ppm_value,
      timestamp: new Date()
    });


    // Save the updated region
    await region.save();
    
    return res.status(200).json({
      success: true,
      message: 'PPM data saved successfully',
      data: {
        region_name: region.region_name,
        latest_ppm: ppm_value,
        valid_count: region.valid_count,
        invalid_count: region.invalid_count,
        total_count: region.total_count,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error in savePpmData:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving PPM data',
      error: error.message || 'Unknown error'
    });
  }
};

module.exports = { savePpmData };