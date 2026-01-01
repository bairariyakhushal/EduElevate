// mailSender.js
// Utility for sending HTML emails using nodemailer and SMTP

const nodemailer = require("nodemailer");
require("dotenv").config();


const mailSender = async (email, title, body) => {
    try {
        // Configure SMTP transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 2525,
            secure: false, // STARTTLS on port 2525
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            // Very high timeout settings for production
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000,   // 30 seconds
            socketTimeout: 60000,     // 60 seconds
            // Disable pooling for more reliability
            pool: false,
            // Additional settings for production stability
            logger: false,
            debug: false,
            // Important: Force new connection
            maxConnections: 1,
            tls: {
                rejectUnauthorized: false // Accept self-signed certificates
            }
        });

        // Skip verification - it causes timeout in some hosting environments
        // await transporter.verify();
        console.log("📧 Sending email via Brevo SMTP...");

        // Send email with provided details
        let info = await transporter.sendMail({
            from: 'EduElevate || Khushal Bairariya',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });

        console.log("✅ Email sent successfully to:", email);
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