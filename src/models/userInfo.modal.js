const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    user_type: {
        type: String,
        required: true,
        enum: ["admin", "user", "other"],
    },
    token: { 
        type: String, 
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
