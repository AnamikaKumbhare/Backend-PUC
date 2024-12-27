const mongoose = require("mongoose");

const vehicleDetailsSchema = new mongoose.Schema({
    reg_no: {
        type: String,
        required: true,
        unique: true, 
    },
    owner_name: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    reg_type_descr: { 
        type: String,
        required: true,
    },
    vehicle_class_desc: { 
        type: String,
        required: true,
    },
    reg_upto: { 
        type: Date,
        required: true,
    },
    vehicle_pucc_details: { 
        type: Object, 
        required: true,
    },
}, {
    timestamps: true, 
});

vehicleDetailsSchema.methods.saveToDB = async function () {
    try {
        const result = await this.save();
        return result._id;
    } catch (error) {
        throw new Error(error);
    }
};

const VehicleDetails = mongoose.model("VehicleDetails", vehicleDetailsSchema);
module.exports = VehicleDetails;
