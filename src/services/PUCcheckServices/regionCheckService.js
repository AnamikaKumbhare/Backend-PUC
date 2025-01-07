const RegionDetail = require('../../models/regionDetail.model');

class RegionService {
    async updateRegionWithRCNumber(regionName, rcNumber, pucValidationResult) {
        try {
            const region = await RegionDetail.findOne({ 
                region_name: regionName // Removed `is_active: true`
            });
            
            if (!region) {
                throw new Error(`Region ${regionName} not found`);
            }

            // Check if RC number already exists in region
            const isExisting = region.registered_numbers.includes(rcNumber);
            
            // Update counts based on PUC validation result
            const isValid = pucValidationResult?.is_valid || false;
            
            const updateQuery = {
                $inc: {
                    total_count: isExisting ? 0 : 1,
                    valid_count: isExisting ? 0 : (isValid ? 1 : 0),
                    invalid_count: isExisting ? 0 : (isValid ? 0 : 1)
                }
            };

            // Add RC number to registered_numbers if it's new
            if (!isExisting) {
                updateQuery.$push = {
                    registered_numbers: rcNumber
                };

                // Add PPM values if available
                if (pucValidationResult?.ppm_values) {
                    updateQuery.$push.ppm_values = pucValidationResult.ppm_values;
                }
            }

            const updatedRegion = await RegionDetail.findOneAndUpdate(
                { region_name: regionName },
                updateQuery,
                { new: true }
            );

            return {
                isNewEntry: !isExisting,
                regionData: updatedRegion
            };
        } catch (error) {
            console.error('Error updating region:', error);
            throw error;
        }
    }

    async getRegionStats(regionName) {
        try {
            const region = await RegionDetail.findOne({ 
                region_name: regionName // Removed `is_active: true`
            });
            
            if (!region) {
                throw new Error(`Region ${regionName} not found`);
            }
            
            return {
                valid_count: region.valid_count,
                invalid_count: region.invalid_count,
                total_count: region.total_count,
                registered_numbers: region.registered_numbers,
                ppm_values: region.ppm_values
            };
        } catch (error) {
            console.error('Error fetching region stats:', error);
            throw error;
        }
    }

    async checkAndCreateRegion(regionData) {
        try {
            const { regionName, city, state } = regionData;

            const existingRegion = await RegionDetail.findOne({ 
                region_name: regionName // Removed `is_active: true`
            });

            if (existingRegion) {
                return {
                    status: 'exists',
                    data: {
                        regionName: existingRegion.region_name,
                        city: existingRegion.city,
                        state: existingRegion.state,
                        valid_count: existingRegion.valid_count,
                        invalid_count: existingRegion.invalid_count,
                        total_count: existingRegion.total_count,
                        registered_numbers: existingRegion.registered_numbers,
                        ppm_values: existingRegion.ppm_values
                    }
                };
            }

            const newRegion = new RegionDetail({
                region_name: regionName,
                city,
                state
            });

            await newRegion.save();

            return {
                status: 'created',
                data: {
                    regionName: newRegion.region_name,
                    city: newRegion.city,
                    state: newRegion.state,
                    valid_count: newRegion.valid_count,
                    invalid_count: newRegion.invalid_count,
                    total_count: newRegion.total_count,
                    registered_numbers: newRegion.registered_numbers,
                    ppm_values: newRegion.ppm_values
                }
            };
        } catch (error) {
            console.error('Error in checkAndCreateRegion:', error);
            throw error;
        }
    }
}

module.exports = new RegionService();
