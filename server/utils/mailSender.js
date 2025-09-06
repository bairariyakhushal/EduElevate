// mailSender.js
// Utility for sending HTML emails using nodemailer and SMTP

const nodemailer = require("nodemailer");
require("dotenv").config();


const mailSender = async (email, title, body) => {
    try {
        // Configure SMTP transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // Send email with provided details
        let info = await transporter.sendMail({
            from: 'EduElevate || Khushal Bairariya',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        console.log("Email sent successfully to:", email);
        console.log("Message ID:", info.messageId);
        return info;

    } catch (err) {
        console.error("Failed to send email to:", email);
        console.error("Error details:", err.message);
        // Throw a user-friendly error
        throw new Error("Email delivery failed. Please try again later.");
    }
}

// Export the mailSender function
module.exports = mailSender; 