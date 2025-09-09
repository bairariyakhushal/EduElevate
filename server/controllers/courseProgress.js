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

    // ✅ Use courseId instead of courseID to match model
    let courseProgress = await CourseProgress.findOne({
      courseId: courseId,  // Changed from courseID
      userId: userId,
    })

    console.log("Debug for courseProgress...", courseProgress);
    
    if (!courseProgress) {
      try {
        courseProgress = await CourseProgress.create({
          courseId: courseId,        // Changed from courseID  
          userId: userId,
          completedVideos: [subSectionId]
        })
        
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
      if (courseProgress.completedVideos.includes(subSectionId)) {
        return res.status(200).json({ 
          success: true,
          message: "Subsection already completed" 
        })
      }

      courseProgress.completedVideos.push(subSectionId)
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