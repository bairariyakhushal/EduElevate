// uploader.js
// Utility for uploading files to Cloudinary

const cloudinary = require("cloudinary").v2;

/**
 Uploads a file to Cloudinary and returns upload details including video duration
 */
exports.uploadToCloudinary = async (file, folder, height, quality) => {
    // Set upload options
    const options = { folder };

    if (height) {
        options.height = height;
    }
    if (quality) {
        options.quality = quality;
    }

    options.resource_type = "auto";

    // Upload file to Cloudinary
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        
        // Log upload result for debugging
        console.log("Cloudinary upload result:", {
            resource_type: result.resource_type,
            duration: result.duration,
            format: result.format
        });
        
        return result;
    } catch (err) {
        console.error("Failed to upload file to Cloudinary:", err.message);
        throw new Error("File upload failed. Please try again later.");
    }
};

