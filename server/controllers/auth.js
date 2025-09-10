const User = require("../models/user");
const Otp = require("../models/otp");
const Profile = require("../models/profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
require("dotenv").config();

/**
 * Send OTP to user's email for registration
 * Generates a unique 6-digit OTP and sends it to the provided email
 * Ensures OTP uniqueness by checking against existing OTPs in database
 */
exports.sendOTP = async (req, res) => {
    try {
        // Fetch email from request body
        const { email } = req.body;

        // Check if user already exists with this email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists. Please login instead."
            });
        }

        // Generate a unique 6-digit OTP
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("Generated OTP: ", otp);

        // Ensure OTP uniqueness by checking database
        let result = await Otp.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            console.log("Regenerated OTP: ", otp);
            result = await Otp.findOne({ otp: otp });
        }

        // Save OTP to database
        const otpBody = await Otp.create({
            email,
            otp: otp
        });

        // Return success response
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully! Please check your email for the verification code.",
            data: otpBody
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again later."
        });
    }
};

/**
 * User Registration Function
 * Validates user input, checks OTP, creates user profile and account
 * Handles password hashing and profile creation
 */
exports.signUp = async (req, res) => {
    try {
        // Fetch all required fields from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNUmber,
            otp
        } = req.body;

        // Validate all required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required. Please fill in all the information."
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match. Please ensure both passwords are identical."
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists. Please login instead."
            });
        }

        // Verify OTP from database
        const recentOtp = await Otp.find({ email })
            .sort({ createdAt: -1 })
            .limit(1);
        console.log("Recent OTP: ", recentOtp);

        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this email. Please request a new OTP."
            });
        } else if (recentOtp[0].otp != otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please enter the correct verification code."
            });
        }

        // Hash password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user profile
        const profileDetails = await Profile.create({
            gender: null,
            DOB: null,
            about: null,
            contactNumber: null,
        });

        function getInitials(name) {
            const parts = name.trim().split(" ");
            if (parts.length === 1) return parts[0][0];         // single name
            return parts[0][0] + parts[1][0];                   // first + last
        }

        const initials = getInitials(`${firstName} ${lastName}`);

        // Create user account
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNUmber,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${initials}`
        });

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Account created successfully! Welcome to EduElevate.",
            data: user
        });
    } catch (err) {
        // Log error and return failure response
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again later."
        });
    }
};

/**
 * User Login Function
 * Authenticates user credentials and generates JWT token
 * Sets secure HTTP-only cookie and returns user data
 */
exports.login = async (req, res) => {
    try {
        // Fetch email and password from request body
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password to login."
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No account found with this email. Please check your email or sign up."
            });
        }

        // Generate JWT token and Compare Password
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "30d",
                }
            );

            // Save token to user document in database
            user.token = token;
            user.password = undefined;
            // Set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: `Password is incorrect`,
            });
        }

    } catch (err) {
        console.error("Error in login: ", err);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again later.",
        });
    }
};

/**
 * Change Password Function
 * Allows authenticated users to change their password
 * Validates old password, hashes new password, and sends email notification
 */
exports.changePassword = async (req, res) => {
    try {
        const {
            oldPassword,
            newPassword,
            confirmNewPassword
        } = req.body;

        console.log("Change password request received for user:", req.user.id);
        console.log("Request body:", { oldPassword: !!oldPassword, newPassword: !!newPassword, confirmNewPassword: !!confirmNewPassword });

        // Validate input fields
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old password, new password, and confirm new password."
            });
        }

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match. Please ensure both new passwords are identical."
            });
        }

        // Find user by ID from JWT token
        const user = await User.findById(req.user.id);

        if (!user) {
            console.log("User not found for ID:", req.user.id);
            return res.status(404).json({
                success: false,
                message: "User account not found. Please login again."
            });
        }

        console.log("User found:", user.email);
        console.log("Stored password hash exists:", !!user.password);

        // Verify old password
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        console.log("Old password verification result:", isOldPasswordCorrect);

        if (isOldPasswordCorrect) {
            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            console.log("New password hashed successfully");

            // Update password in database
            user.password = hashedNewPassword;
            await user.save();
            console.log("Password updated in database");

            // Send email notification
            try {
                const response = await mailSender(
                    user.email,
                    'Password Updated Successfully',
                    passwordUpdated(user.email, user.firstName)
                );
                console.log("Password update email sent successfully");
            } catch (emailError) {
                console.log("Failed to send password update email:", emailError.message);
                // Don't fail the request if email fails
            }

            return res.status(200).json({
                success: true,
                message: "Password updated successfully! You can now login with your new password."
            });
        } else {
            console.log("Old password verification failed");
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect. Please enter your current password correctly."
            });
        }
    } catch (err) {
        console.error("Error in changePassword: ", err);
        return res.status(500).json({
            success: false,
            message: "Failed to update password. Please try again later."
        });
    }
};