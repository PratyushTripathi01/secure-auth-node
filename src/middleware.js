const jwt = require("jsonwebtoken");
const { getAuthConfig } = require("./config");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Check if header exists
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  // Check if format is "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  const config = getAuthConfig();

  // Verify token
  jwt.verify(token, config.accessTokenSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Attach user to request object
    req.user = user;
    next();
  });
}


function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    // Check if req.user is set (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // Check if user.role exists
    if (!req.user.role) {
      return res.status(403).json({ message: "Forbidden: role missing from token" });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: You do not have the required role." });
    }

    // All checks passed
    next();
  };
}


module.exports = { authMiddleware, roleMiddleware };