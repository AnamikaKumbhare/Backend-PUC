const jwt = require("jsonwebtoken");

/**
 * Middleware to verify a JWT token from the Authorization header of a request.
 * If the token is valid, attaches the decoded user data to the request object.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const verifyToken = (req, res, next) => {
  // Extract the Authorization header from the request
  const authHeader = req.headers.authorization;

  // Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  // Extract the token part of the Authorization header
  const token = authHeader.split(" ")[1];
  //console.log("Extracted Token:", token);

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token");

    req.user = decoded; // Attach decoded user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    // Handle errors during token verification
    console.error("Token verification error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
