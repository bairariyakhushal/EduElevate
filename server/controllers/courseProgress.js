const mongoose = require("mongoose")
const Section = require("../models/section");
const SubSection = require("../models/subSection")
const CourseProgress = require("../models/courseProgress")
const Course = require("../models/course")

exports.updateCourseProgress = async (req, res) => {
    const { courseId, subSectionId } = req.body
    const userId = req.user.id

    try {
        // Check if the subsection is valid
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(400).json({
                error: "Invalid Subsection ID"
            })
        }

        // Find the course progress document for the user and course
        let courseProgress = await CourseProgress.findOne({
            courseId: courseId, // Changed from courseID to courseId to match model
            userId: userId,
        })

        if (!courseProgress) {
            // Create new course progress document if it doesn't exist
            courseProgress = await CourseProgress.create({
                courseId: courseId, // Changed from courseID to courseId
                userId: userId,
                completedVideos: [subSectionId]
            })
        } else {
            // If course progress exists, check if the subsection is already completed
            if (courseProgress.completedVideos.includes(subSectionId)) {
                return res.status(400).json({
                    error: "Subsection already completed"
                })
            }

            // Push the subsection into the completedVideos array
            courseProgress.completedVideos.push(subSectionId)
            await courseProgress.save()
        }

        return res.status(200).json({
            success: true,
            message: "Subsection completed successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        })
    }
}