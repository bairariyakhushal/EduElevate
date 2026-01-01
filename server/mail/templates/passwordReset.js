exports.passwordReset = (email, name, resetLink) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Password Reset Request - EduElevate</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #2563eb;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
    
            .reset-button {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
                font-size: 16px;
            }
    
            .reset-button:hover {
                background-color: #1d4ed8;
            }
    
            .warning {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
                color: #2563eb;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="https://eduelevate-ai.vercel.app/"><img class="logo"
                    src="https://res.cloudinary.com/dzkaggnlf/image/upload/v1753640145/black1_ydxyum.png" alt="EduElevate Logo"></a>
            <div class="message">Password Reset Request</div>
            <div class="body">
                <p>Hello ${name},</p>
                <p>We received a request to reset your password for your EduElevate account associated with <span class="highlight">${email}</span>.</p>
                <p>Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="reset-button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
                
                <div class="warning">
                    <strong>Important:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>This link will expire in 5 minutes for security reasons</li>
                        <li>If you didn't request this password reset, please ignore this email</li>
                        <li>Your password will remain unchanged until you click the link above</li>
                    </ul>
                </div>
            </div>
            <div class="support">If you have any questions or need further assistance, please feel free to reach out to us
                at <a href="mailto:info@EduElevate.com">info@EduElevate.com</a>. We are here to help!
            </div>
        </div>
    </body>
    
    </html>`;
}; 