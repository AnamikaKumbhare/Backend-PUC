const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, userData) => {
    const payload = {
        iat: Math.floor(Date.now() / 1000), 
        user_id: userId.toString(), 
        username: userData.username, 
        email: userData.email, 
        user_type: userData.user_type 
    };

    const secretKey = process.env.SECRET_KEY || 'your_default_secret_key';
    return jwt.sign(payload, secretKey, { algorithm: 'HS256' });
};

module.exports = {
    generateToken
};
