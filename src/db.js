const mongoose = require("mongoose");

function connectToMongoDB() {
  
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not found in environment variables");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

module.exports = connectToMongoDB;
