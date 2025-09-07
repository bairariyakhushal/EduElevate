const Subsection = require('../models/subSection');
const Section = require('../models/section');
const { uploadToCloudinary } = require('../utils/uploader');
require("dotenv").config();

/**
 * Create a new subsection for a section
 * Validates input, uploads video, creates subsection, and adds it to the section
 */
exports.createSubsection = async (req, res) => {
    try {
        // Fetch sectionId, title, description, timeDuration from request body
        const { sectionId, title, description, timeDuration } = req.body;
        // Fetch video file from request files
        const videoFile = req.files?.video || req.files?.videoFile;

        // Validate required fields (timeDuration is now optional since we auto-detect from video)
        if (!sectionId || !title || !description || !videoFile) {
            return res.status(400).json({
                success: false,
                message: "Section ID, title, description, and video file are required to create a subsection."
            });
        }

        // Upload video to Cloudinary
        const uploadDetails = await uploadToCloudinary(videoFile, process.env.FOLDER_NAME);
        console.log("Cloudinary upload details:", {
            secure_url: uploadDetails.secure_url,
            resource_type: uploadDetails.resource_type,
            format: uploadDetails.format
        });
        
        // Get video duration from Cloudinary response
        let videoDuration = timeDuration;
        
        // If video was uploaded and has duration info from Cloudinary, use that
        if (uploadDetails.resource_type === 'video' && uploadDetails.duration) {
            videoDuration = Math.round(uploadDetails.duration).toString(); // Convert to string and round to nearest second
            console.log(`Auto-detected video duration: ${videoDuration} seconds`);
        } else if (!timeDuration || timeDuration === "0" || timeDuration === 0) {
            // Fallback: if no duration provided and couldn't detect from Cloudinary
            videoDuration = "0";
            console.log("Warning: Could not determine video duration, setting to 0");
        }

        // Create new subsection
        const newSubSection = await Subsection.create({
            title: title,
            description: description,
            timeDuration: videoDuration,
            videoUrl: uploadDetails.secure_url
        });
        
        console.log("Created new subsection with video URL:", newSubSection.videoUrl);
        
        // Add subsection to section's subSection array
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $push: {
                    subSection: newSubSection._id
                }
            },
            { new: true }
        );

        // Populate updated section for frontend
        const populatedSection = await Section.findById(sectionId).populate("subSection").exec();

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Subsection created successfully.",
            updatedSection: populatedSection
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to create subsection. Please try again later."
        });
    }
};

/**
 * Update a subsection's details
 * Validates input, uploads new video, and updates the subsection document
 */
exports.updateSubSection = async (req, res) => {
    try {
        // Fetch subSectionId, title, description, timeDuration from request body
        const { subSectionId, sectionId, title, description, timeDuration } = req.body;
        // Fetch video file from request files
        const videoFile = req.files?.video || req.files?.videoFile;

        // Validate required fields
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: "subSectionId is required."
            });
        }

        // If new video provided, upload and set url; else keep existing
        let videoUrlUpdate = {}
        let detectedDuration = null;
        
        if (videoFile) {
            const uploadDetails = await uploadToCloudinary(videoFile, process.env.FOLDER_NAME);
            videoUrlUpdate = { videoUrl: uploadDetails.secure_url };
            
            // Auto-detect duration from Cloudinary for new video
            if (uploadDetails.resource_type === 'video' && uploadDetails.duration) {
                detectedDuration = Math.round(uploadDetails.duration).toString();
                console.log(`Auto-detected video duration: ${detectedDuration} seconds`);
            }
        }

        // Update subsection document
        // Build partial update object only for provided fields
        const updateObj = {
            ...(title ? { title } : {}),
            ...(description ? { description } : {}),
            // Use detected duration from new video, or provided timeDuration, or keep existing
            ...(detectedDuration ? { timeDuration: detectedDuration } : (timeDuration ? { timeDuration } : {})),
            ...videoUrlUpdate,
        }

        if (Object.keys(updateObj).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update.",
            })
        }

        await Subsection.findByIdAndUpdate(
            { _id: subSectionId },
            updateObj,
            { new: true }
        );

        // Return populated section back for frontend update if sectionId provided
        if (sectionId) {
            const populatedSection = await Section.findById(sectionId).populate("subSection").exec();
            return res.status(200).json({
                success: true,
                message: "Subsection updated successfully.",
                updatedSection: populatedSection,
            });
        }
        // Fallback success
        return res.status(200).json({
            success: true,
            message: "Subsection updated successfully."
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to update subsection. Please try again later."
        });
    }
};

/**
 * Delete a subsection from a section
 * Validates input, deletes subsection, and removes it from the section
 */
exports.deleteSubSection = async (req, res) => {
    try {
        // Fetch subSectionId and sectionId from request body
        const { subSectionId, sectionId } = req.body;

        // Validate required fields
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Subsection ID and section ID are required."
            });
        }

        // Delete subsection document
        await Subsection.findByIdAndDelete(subSectionId);

        // Remove subsection from section's subSection array
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId
                }
            },
            { new: true }
        );

        // Fetch updated section populated for frontend
        const populatedSection = await Section.findById(sectionId).populate("subSection").exec();

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Subsection deleted successfully.",
            updatedSection: populatedSection,
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to delete subsection. Please try again later."
        });
    }
};