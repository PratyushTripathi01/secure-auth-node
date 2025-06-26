# 🔐 secure-auth-node

A lightweight and flexible authentication module for Node.js projects, built with JWT and MongoDB. Easily add secure access token, refresh token, and role-based authentication to your Express apps.

---

## 💡 Why use `secure-auth-node`?

Most authentication setups are repetitive. This library saves time by offering a plug-and-play JWT system with role-based access and refresh token support — without forcing you to change your app structure.

---

## 📦 Installation

```bash
npm install secure-auth-node
````

> ✅ Also ensure `mongoose` is installed in your project:

```bash
npm install mongoose
```

🔰 Minimal example:

```js
const { generateAccessToken } = require("secure-auth-node");
```

---

## 🚀 Features

* 🔒 Generate access and refresh tokens using JWT
* 🧠 Role-based access control (admin, user, etc.)
* ♻️ Refresh token support with token validation via MongoDB
* 📦 Easy to integrate into any Node.js + Express backend
* ⚙️ Customizable token secret and expiry configuration

---

## 🧩 Usage Example

```js
// server.js
require("dotenv").config();
const express = require("express");
const {
  connectToMongoDB,
  initAuthConfig,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  authMiddleware,
  roleMiddleware,
} = require("secure-auth-node");

const app = express();
app.use(express.json());

// ✅ Connect to MongoDB
connectToMongoDB();

// ✅ Initialize Auth Config
initAuthConfig({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
});

// ✅ Fake user DB
const users = [
  { id: 1, username: "admin", role: "admin" },
  { id: 2, username: "user", role: "user" },
];

// 🔐 Login route
app.post("/login", async (req, res) => {
  const { username } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ message: "Invalid user" });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  res.json({ accessToken, refreshToken });
});

// 🔁 Refresh token
app.post("/refresh", async (req, res) => {
  try {
    const { token } = req.body;
    const newAccessToken = await refreshAccessToken(token);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

// 👤 Protected route
app.get("/dashboard", authMiddleware, (req, res) => {
  res.send(`Hello, ${req.user.username}`);
});

// 🛡️ Admin-only route
app.get("/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.send("Welcome Admin!");
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
```

---

## 📁 .env Configuration

Create a `.env` file in your project root directory with the following keys:

```env
MONGO_URI=your-mongodb-uri
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
```

> 💡 You can generate token secrets using tools like [jwt.io](https://jwt.io/) or `openssl rand -hex 32`.

---

## 🧠 Functions Exported

| Function                     | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `connectToMongoDB()`         | Connect to MongoDB using `process.env.MONGO_URI`       |
| `initAuthConfig(config)`     | Set secrets and token expiry                           |
| `generateAccessToken(user)`  | Returns JWT access token                               |
| `generateRefreshToken(user)` | Returns JWT refresh token and stores it in DB          |
| `refreshAccessToken(token)`  | Validates refresh token and returns a new access token |
| `authMiddleware`             | Protects routes, validates access token                |
| `roleMiddleware(['role'])`   | Grants access to users with specific roles             |

---

## 📩 API Usage Guide

These are sample API routes provided for testing and demonstration purposes (from the `test/server.js` file). You can freely customize them to fit your project.

> 🛠️ This package **only handles authentication logic** like generating tokens, verifying tokens, and role checking — it does **not** control how your users log in or how your routes are structured.

---

### 🔐 Login

```http
POST /login
```

📦 **Request Body** (JSON format):

```json
{
  "username": "admin"
}
```

✅ You can customize fields like:

```json
{
  "username": "admin",
  "password": "your-password"
}
```

---

### 🔁 Refresh Access Token

```http
POST /refresh
```

📦 **Request Body** (JSON format):

```json
{
  "token": "your-refresh-token"
}
```

> The library uses `const { token } = req.body`, so structure must match.

---

### 👤 Protected Route

```http
GET /dashboard
Headers:
Authorization: Bearer your-access-token
```

---

### 🛡️ Admin-Only Route

```http
GET /admin
Headers:
Authorization: Bearer your-access-token
```

Only users with the role `"admin"` can access this.

---

## 🔐 How Refresh Tokens Are Stored

Refresh tokens are securely stored in your MongoDB using a simple schema.

* You **must** call `connectToMongoDB()` in your app
* You **own and manage** your MongoDB — this library **does not** access it
* You can clear or revoke refresh tokens directly from your DB

---

## ⚙️ Custom Configuration

```js
initAuthConfig({
  accessTokenSecret: 'your-secret',
  refreshTokenSecret: 'your-refresh-secret',
  accessTokenExpiry: '25m', // default is '15m'
  refreshTokenExpiry: '10d' // default is '7d'
});
```

---

## 📃 License

This project is licensed under the **Apache-2.0 License**.

---

## 🙌 Contributing

Contributions, bug reports, and feature requests are welcome!
Feel free to fork the repo and open a pull request, or [open an issue](https://github.com/PratyushTripathi01/secure-auth-node/issues).

---

## 📬 Contact

**Author:** Pratyush Tripathi
For help, ideas, or questions, [open an issue on GitHub](https://github.com/PratyushTripathi01/secure-auth-node/issues)

---

## ⭐️ Give it a star if you find it useful!