const { performPucValidation } = require('../services/validationService');
const VehicleDetails = require('../models/vehicleDetails.model'); 
const { ResponseHandler } = require('../utils/responseHandler'); 
const moment = require('moment');

const checkPucValidation = async (req, res) => {
    try {
        const data = req.body;

        if (!data.rc_number) {
            return ResponseHandler(res, 400, 'RC number is required');
        }

        // Check if vehicle data already exists in the database
        const existingVehicle = await VehicleDetails.findOne({ reg_no: data.rc_number });

        if (existingVehicle) {
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

            return ResponseHandler(res, 200, 'PUC details fetched successfully', formattedData);
        }

        // Perform external validation if not found in the database
        const rtoResponse = await performPucValidation(data.rc_number);

        if (rtoResponse.error) {
            return ResponseHandler(res, 400, `Validation Error: ${rtoResponse.error}`);
        }

        const message = rtoResponse.result.vehicle_pucc_details ? "PUC is Valid!!" : "PUC is Invalid!!";
        const checkedOn = moment().format('YYYY-MM-DD');
        const formattedData = {
            message,
            reg_no: rtoResponse.result.reg_no,
            owner_name: rtoResponse.result.owner_name,
            model: rtoResponse.result.model,
            state: rtoResponse.result.state,
            reg_type_descr: rtoResponse.result.reg_type_descr,
            vehicle_class_desc: rtoResponse.result.vehicle_class_desc,
            reg_upto: rtoResponse.result.reg_upto,
            vehicle_pucc_details: rtoResponse.result.vehicle_pucc_details,
            checked_on: checkedOn
        };

        // Save to the database using Mongoose
        const vehicleDetails = new VehicleDetails(formattedData);
        await vehicleDetails.save();

        return ResponseHandler(res, 200, 'PUC details validated and saved successfully', formattedData);
    } catch (error) {
        console.error(error);
        return ResponseHandler(res, 500, 'Error Occurred', { error: error.message });
    }
};

module.exports = {
    checkPucValidation
};
