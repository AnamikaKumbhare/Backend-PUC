const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || "your_secret_key";

// Generate JWT token
const generateToken = (userId, user) => {
    const payload = {
        id: userId,
        email: user.email,
        user_type: user.user_type
    };
    return jwt.sign(payload, secretKey, { expiresIn: '3h' });
};

module.exports = {
    generateToken
};
