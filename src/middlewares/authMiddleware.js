// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || "your_secret_key";

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from the `Authorization` header
    if (!token) {
        return res.status(401).json({
            status: "failed",
            message: "Unauthorized access. Token missing.",
        });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                status: "failed",
                message: "Invalid or expired token.",
            });
        }

        req.user = decoded; // Attach decoded payload to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = { verifyToken };
