const { performPucValidation } = require('../services/PUCcheckServices/validationService');
const VehicleDetails = require('../models/vehicleDetails.model'); 
const { ResponseHandler } = require('../utils/responseHandler'); 
const moment = require('moment');

const checkPucValidation = async (req, res) => {
    try {
        const { rc_number } = req.body;

        if (!rc_number) {
            return ResponseHandler(res, 400, 'RC number is required');
        }

        // Check if vehicle data already exists in the database
        const existingVehicle = await VehicleDetails.findOne({ reg_no: rc_number });

        if (existingVehicle) {
            console.log('Vehicle found in database:', rc_number);
            
            // Format the response data from existing vehicle
            const message = existingVehicle.vehicle_pucc_details ? "PUC is Valid!!" : "PUC is Invalid!!";
            const formattedData = {
                message,
                reg_no: existingVehicle.reg_no,
                owner_name: existingVehicle.owner_name,
                model: existingVehicle.model,
                state: existingVehicle.state,
                reg_type_descr: existingVehicle.reg_type_descr,
                vehicle_class_desc: existingVehicle.vehicle_class_desc,
                reg_upto: existingVehicle.reg_upto,
                vehicle_pucc_details: existingVehicle.vehicle_pucc_details,
                checked_on: existingVehicle.checked_on || moment().format('YYYY-MM-DD')
            };

            // Return the data from database directly without making external API call
            return ResponseHandler(res, 200, 'PUC details fetched from database', formattedData);
        }

        console.log('Vehicle not found in database, performing external validation:', rc_number);

        // Only perform external validation if not found in the database
        const rtoResponse = await performPucValidation(rc_number);

        // Check if the response is valid
        if (!rtoResponse || !rtoResponse.result) {
            return ResponseHandler(res, 400, `Validation failed for RC Number ${rc_number}: No data found or invalid response.`);
        }

        const { reg_no, owner_name, model, state, reg_type_descr, vehicle_class_desc, reg_upto, vehicle_pucc_details } = rtoResponse.result;

        const message = vehicle_pucc_details ? "PUC is Valid!!" : "PUC is Invalid!!";
        const checkedOn = moment().format('YYYY-MM-DD');

        const formattedData = {
            message,
            reg_no,
            owner_name,
            model,
            state,
            reg_type_descr,
            vehicle_class_desc,
            reg_upto,
            vehicle_pucc_details,
            checked_on: checkedOn
        };

        // Save to the database using Mongoose
        const vehicleDetails = new VehicleDetails(formattedData);
        await vehicleDetails.save();

        return ResponseHandler(res, 200, 'PUC details validated and saved successfully', formattedData);
    } catch (error) {
        console.error('Error:', error);
        return ResponseHandler(res, 500, 'Error Occurred', { error: error.message });
    }
};

module.exports = {
    checkPucValidation
};