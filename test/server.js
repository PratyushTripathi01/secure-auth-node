require("dotenv").config(); // Load environment variables
const express = require("express");
const {
  connectToMongoDB,
  initAuthConfig,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  authMiddleware,
  roleMiddleware,
} = require("../index"); // Use "secure-auth-node" after publishing

const app = express();
app.use(express.json());

// Connect to MongoDB
connectToMongoDB();

// Initialize auth configuration
initAuthConfig({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
});

// Fake user database
const users = [
  { id: 1, username: "admin", role: "admin" },
  { id: 2, username: "user", role: "user" },
];

// Login route - returns access and refresh token
app.post("/login", async (req, res) => {
  const { username } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ message: "Invalid user" });

  try {
    const accessToken = generateAccessToken(user); 
    const refreshToken = await generateRefreshToken(user); 
    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Refresh route - returns new access token
app.post("/refresh", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Refresh token required" });

    const newAccessToken = await refreshAccessToken(token);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

// Protected route - requires access token
app.get("/dashboard", authMiddleware, (req, res) => {
  res.send(`Hello, ${req.user.username}`);
});

// Admin-only route
app.get("/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.send("Welcome Admin!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
