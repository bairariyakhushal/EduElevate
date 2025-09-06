const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Database Connection Function
 * Establishes connection to MongoDB using environment variables
 * Configures connection options for optimal performance
 * Handles connection success and error scenarios
 */
exports.dbConnect = () => {
    mongoose.connect(process.env.DB_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("✅ Database connected successfully");
        console.log("📊 MongoDB connection established");
    })
    .catch((err) => {
        console.error("❌ Database connection failed");
        console.error("🔍 Error details:", err.message);
        process.exit(1); // Exit process if database connection fails
    });
};
