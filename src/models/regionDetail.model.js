const mongoose = require("mongoose");

const regionDetailSchema = new mongoose.Schema({
    region_name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    valid_count: {
        type: Number,
        default: 0,
    },
    invalid_count: {
        type: Number,
        default: 0,
    },
    total_count: {
        type: Number,
        default: 0,
    },
    ppm_values: [
        {
            value: {
                type: Number,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    registered_numbers: {
        type: [String],
        validate: {
            validator: function (numbers) {
                // Validate each entry to ensure it's a 10-character alphanumeric string
                return numbers.every(num => /^[A-Za-z0-9]{10}$/.test(num));
            },
            message: "Each registered number must be a 10-character alphanumeric string.",
        },
        default: [],
    },
}, { timestamps: true });

const regionDetail = mongoose.model("regionDetail", regionDetailSchema);

module.exports = regionDetail;
