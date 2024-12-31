const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    req.user = decoded; // Attach decoded data to request
    next(); // Proceed to the next middleware/handler
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
