const User = require('../models/user');
const mailSender = require('../utils/mailSender');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {passwordReset}=require('../mail/templates/passwordReset');
const {passwordUpdate}=require('../mail/templates/passwordUpdate');

/**
 * Generate and send password reset token via email
 * Creates a unique token, saves it to user's account with expiration, and sends email
 */
exports.resetPasswordToken = async (req, res) => {
    try {
        // Fetch email from request body
        const { email } = req.body;
        
        // Find user by email address
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No account found with this email address. Please check your email or sign up."
            });
        }

        // Generate unique reset token
        const token = crypto.randomUUID();

        // Update user with reset token and expiration (5 minutes)
        await User.findOneAndUpdate(
            { email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000, // 5 minutes from now
            },
            { new: true }
        );

        // Create password reset URL
        const url = `http://localhost:3000/update-password/${token}`;

        // Send password reset email
        await mailSender(
            email,
            "Password Reset Request - EduElevate",
            passwordReset(email, user.firstName, url)
        );
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Password reset link sent successfully! Please check your email.'
        });
    } catch (err) {
        // Log error and return failure response
        console.log("Err msg :" ,err.message);
        return res.status(500).json({
            success: false,
            message: "Failed to send password reset email. Please try again later."
        });
    }
};

/**
 * Reset user password using token
 * Validates token, checks expiration, and updates password
 */
exports.resetPassword = async (req, res) => {
    try {
        // Fetch password, confirmPassword, and token from request body
        const { password, confirmPassword, token } = req.body;

        // Validate password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match. Please ensure both passwords are identical."
            });
        }

        // Find user by reset token
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token. Please request a new password reset."
            });
        }

        // Check if token has expired
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Password reset link has expired. Please request a new password reset."
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and clear reset token
        await User.findOneAndUpdate(
            { token: token },
            { 
                password: hashedPassword,
                token: undefined,
                resetPasswordExpires: undefined
            },
            { new: true }
        );

        // Send password update confirmation email
        await mailSender(
            user.email,
            "Password Updated Successfully - EduElevate",
            passwordUpdate(user.email, user.firstName)
        );

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully! You can now login with your new password."
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to reset password. Please try again later."
        });
    }
};