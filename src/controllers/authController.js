const { hashPassword, checkPasswordHash } = require('../services/AuthServices/hashService');
const { generateToken } = require('../services/AuthServices/jwtService');
const User = require('../models/userInfo.modal'); // Mongoose model

// Handle Login
const handleLogin = async (req, res) => {
    try {
        const { email, password, user_type } = req.body;

        // Check for required parameters
        if (!email || !password || !user_type) {
            return res.status(400).json({
                status: "failed",
                message: "Email, Password, and User Type are required"
            });
        }

        // Find user using Mongoose
        const user = await User.findOne({ email, user_type });

        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found, please register"
            });
        }

        // Check if the password is correct
        const isPasswordCorrect = checkPasswordHash(user.password, password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid password"
            });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.toObject());

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "failed",
            message: "An error occurred during login",
            error: error.message
        });
    }
};

// Handle Signup
const handleSignup = async (req, res) => {
    try {
        const { username, email, password, confirm_password, user_type } = req.body;

        // Check for required parameters
        if (!username || !email || !password || !confirm_password || !user_type) {
            return res.status(400).json({
                status: "failed",
                message: "All parameters are required: Username, Email, Password, Confirm Password, and User Type"
            });
        }

        // Check if password and confirm password match
        if (password !== confirm_password) {
            return res.status(400).json({
                status: "failed",
                message: "Password and Confirm Password must match"
            });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: "failed",
                message: "User already exists, please login"
            });
        }

        // Hash the password
        const hashedPassword = hashPassword(password);

        // Create a new user document
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            user_type
        });

        // Save the new user to the database
        const savedUser = await newUser.save();

        // Generate JWT token
        const token = generateToken(savedUser._id, savedUser.toObject());

        return res.status(201).json({
            status: "success",
            message: "Signup successful",
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "failed",
            message: "An error occurred during signup",
            error: error.message
        });
    }
};

module.exports = {
    handleLogin,
    handleSignup
};
