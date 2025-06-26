const jwt = require("jsonwebtoken");
const { getAuthConfig } = require("./config");
const RefreshToken = require("./models/RefreshToken");

function generateAccessToken(payload) {
  const config = getAuthConfig();

  // Validate payload
  if (!payload || typeof payload !== "object") {
    throw new Error("Access token payload must be a valid object");
  }

  // Validate secret
  if (!config.accessTokenSecret) {
    throw new Error("Access token secret is not set");
  }

  // Validate expiry
  if (!config.accessTokenExpiry) {
    throw new Error("Access token expiry is not set");
  }

  // Sign and return token
  return jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenExpiry,
  });
}

async function generateRefreshToken(payload) {
  const config = getAuthConfig();

  // Validate payload
  if (!payload || typeof payload !== "object") {
    throw new Error("Refresh token payload must be a valid object");
  }

  // Validate secret
  if (!config.refreshTokenSecret) {
    throw new Error("Refresh token secret is not configured");
  }

  // Validate expiry
  if (!config.refreshTokenExpiry) {
    throw new Error("Refresh token expiry is not configured");
  }

  // Create token
  let token;
  try {
    token = jwt.sign(payload, config.refreshTokenSecret, {
      expiresIn: config.refreshTokenExpiry,
    });
  } catch (err) {
    throw new Error("Failed to generate refresh token: " + err.message);
  }

  // Save to DB
  try {
    await RefreshToken.create({ token });
  } catch (dbError) {
    throw new Error("Failed to store refresh token in DB: " + dbError.message);
  }

  return token;
}

async function refreshAccessToken(oldToken) {
  const config = getAuthConfig();

  // Check if token is provided
  if (!oldToken || typeof oldToken !== "string") {
    throw new Error("Refresh token must be provided and must be a string");
  }

  // Check if secret is configured
  if (!config.refreshTokenSecret) {
    throw new Error("Refresh token secret is not configured");
  }

  // Check if token exists in DB
  const existing = await RefreshToken.findOne({ token: oldToken });
  if (!existing) {
    throw new Error("Invalid or revoked refresh token");
  }

  // Verify and decode token
  let decoded;
  try {
    decoded = jwt.verify(oldToken, config.refreshTokenSecret);
  } catch (err) {
    throw new Error("Failed to verify refresh token: " + err.message);
  }

  // Strip off iat and exp to avoid JWT conflicts
  const { iat, exp, ...cleanPayload } = decoded;

  // Generate new access token with clean payload
  try {
    return generateAccessToken(cleanPayload);
  } catch (err) {
    throw new Error("Failed to generate new access token: " + err.message);
  }
}

function verifyAccessToken(token) {
  const config = getAuthConfig();

  // Check token
  if (!token || typeof token !== "string") {
    throw new Error("Access token must be a valid string");
  }

  // Check secret
  if (!config.accessTokenSecret) {
    throw new Error("Access token secret is not configured");
  }

  // Try verifying token
  try {
    return jwt.verify(token, config.accessTokenSecret);
  } catch (err) {
    throw new Error("Invalid or expired access token: " + err.message);
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  verifyAccessToken,
};
