const User = require('../models/user');
const jwt = require('jsonwebtoken');
require("dotenv").config();

/**
 * Authentication Middleware
 * Verifies JWT token from request headers, cookies, or body
 * Decodes token and attaches user information to request object
 * Used to protect routes that require user authentication
 */
exports.auth = async (req, res, next) => {
    try {
        // Extract token from multiple possible sources (prioritize Authorization header)
        const token = req.header("Authorization")?.replace("Bearer ", "") ||
            req.cookies.token ||
            req.body.token;

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login to access this resource."
            });
        }

        try {
            // Verify and decode JWT token
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token decoded successfully for user:", decode.email);
            req.user = decode;
        } catch (err) {
            console.log("Token verification failed:", err.message);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please login again."
            });
        }

        // Proceed to next middleware or route handler
        next();
    } catch (err) {
        console.error("Error in auth middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again later."
        });
    }
};

/**
 * Student Role Middleware
 * Checks if authenticated user has Student account type
 * Used to protect routes that are only accessible to students
 */
exports.isStudent = async (req, res, next) => {
    try {
        // Check if user is a student
        if (req.user.accountType !== "Student") {
            return res.status(403).json({
                success: false,
                message: "Access denied. This feature is only available for students."
            });
        }
        next();
    } catch (err) {
        console.error("Error in isStudent middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Unable to verify user role. Please try again later."
        });
    }
};

/**
 * Instructor Role Middleware
 * Checks if authenticated user has Instructor account type
 * Used to protect routes that are only accessible to instructors
 */
exports.isInstructor = async (req, res, next) => {
    try {
        // Check if user is an instructor
        if (req.user.accountType !== "Instructor") {
            return res.status(403).json({
                success: false,
                message: "Access denied. This feature is only available for instructors."
            });
        }
        next();
    } catch (err) {
        console.error("Error in isInstructor middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Unable to verify user role. Please try again later."
        });
    }
};

/**
 * Admin Role Middleware
 * Checks if authenticated user has Admin account type
 * Used to protect routes that are only accessible to administrators
 */
exports.isAdmin = async (req, res, next) => {
    try {
        // Check if user is an admin
        if (req.user.accountType !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. This feature is only available for administrators."
            });
        }
        next();
    } catch (err) {
        console.error("Error in isAdmin middleware:", err);
        return res.status(500).json({
            success: false,
            message: "Unable to verify user role. Please try again later."
        });
    }
};
