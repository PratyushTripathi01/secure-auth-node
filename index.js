const {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  verifyAccessToken,
} = require("./src/auth");
const { authMiddleware, roleMiddleware } = require("./src/middleware");
const { initAuthConfig } = require("./src/config");
const connectToMongoDB = require("./src/db");

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  verifyAccessToken,
  authMiddleware,
  roleMiddleware,
  initAuthConfig,
  connectToMongoDB,
};