const mongoose = require("mongoose")
const Section = require("../models/section")
const SubSection = require("../models/subSection")
const CourseProgress = require("../models/courseProgress")
const Course = require("../models/course")
exports.updateCourseProgress = async (req, res) => {
  const { courseId, subSectionId } = req.body
  const userId = req.user.id

  try {
    // Check if the subsection is valid
    const subSection = await SubSection.findById(subSectionId)
    if (!subSection) {
      return res.status(404).json({ 
        success: false,
        message: "Invalid subsection" 
      })
    }

    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("Debug for courseProgress...", courseProgress);
    
    if (!courseProgress) {
      // ✅ CREATE course progress instead of returning 404
      try {
        courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [subSectionId] // Add the current video as completed
        })
        console.log("Created new course progress:", courseProgress)
        
        return res.status(200).json({ 
          success: true,
          message: "Course progress created and lecture marked complete" 
        })
      } catch (createError) {
        console.error("Error creating course progress:", createError)
        return res.status(500).json({
          success: false,
          message: "Failed to create course progress"
        })
      }
    } else {
      // If course progress exists, check if the subsection is already completed
      if (courseProgress.completedVideos.includes(subSectionId)) {
        return res.status(200).json({ 
          success: true,
          message: "Subsection already completed" 
        })
      }

      // Push the subsection into the completedVideos array
      courseProgress.completedVideos.push(subSectionId)
      
      // Save the updated course progress
      await courseProgress.save()
      
      return res.status(200).json({ 
        success: true,
        message: "Course progress updated" 
      })
    }

  } catch (error) {
    console.error("Error in updateCourseProgress:", error)
    return res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    })
  }
}