const Course = require('../models/course');
const Section = require('../models/section');

/**
 * Create a new section for a course
 * Validates input, creates section, and adds it to the course
 */
exports.createSection = async (req, res) => {
    try {
        // Fetch sectionName and courseId from request body
        const { sectionName, courseId } = req.body;

        // Validate required fields
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Section name and course ID are required."
            });
        }

        // Create new section
        const newSection = await Section.create({
            sectionName
        });

        // Add section to course's courseContent array
        await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            { new: true }
        );

        // Fetch fully populated course for frontend consumption
        const updatedCourseDetails = await Course.findOne({ _id: courseId })
            .populate({
                path: "instructor",
                populate: { path: "additionalDetails" },
            })
            .populate("category")
            .populate("ratingAndReview")
            .populate({
                path: "courseContent",
                populate: { path: "subSection" },
            })
            .exec();

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Section created successfully.",
            updatedCourseDetails
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to create section. Please try again later."
        });
    }
};

/**
 * Update a section's name
 * Validates input and updates the section document
 */
exports.updateSection = async (req, res) => {
    try {
        // Fetch sectionName, sectionId and courseId from request body
        const { sectionName, sectionId, courseId } = req.body;

        // Validate required fields
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Section name and section ID are required."
            });
        }

        // Update section name
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName: sectionName },
            { new: true }
        );

        // If courseId provided, return fully populated course to update frontend state
        if (courseId) {
            const updatedCourseDetails = await Course.findOne({ _id: courseId })
                .populate({
                    path: "instructor",
                    populate: { path: "additionalDetails" },
                })
                .populate("category")
                .populate("ratingAndReview")
                .populate({
                    path: "courseContent",
                    populate: { path: "subSection" },
                })
                .exec();

            return res.status(200).json({
                success: true,
                message: "Section updated successfully.",
                updatedCourseDetails,
            });
        }

        // Fallback: return just updated section
        return res.status(200).json({
            success: true,
            message: "Section updated successfully.",
            updatedSection,
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to update section. Please try again later."
        });
    }
};

/**
 * Delete a section from a course
 * Validates input, deletes section, and removes it from the course
 */
exports.deleteSection = async (req, res) => {
    try {
        // Fetch sectionId and courseId from request body
        const { sectionId, courseId } = req.body;

        // Validate required fields
        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Section ID and course ID are required."
            });
        }

        // Delete section document
        await Section.findByIdAndDelete(sectionId);

        // Remove section from course's courseContent array
        await Course.findByIdAndUpdate(
            courseId,
            {
                $pull: {
                    courseContent: sectionId
                }
            },
            { new: true }
        );

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully."
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to delete section. Please try again later."
        });
    }
};