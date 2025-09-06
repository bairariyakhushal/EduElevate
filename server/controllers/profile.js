// Import required models
const Profile = require('../models/profile');
const User = require('../models/user');
const Course = require('../models/course');
const { uploadToCloudinary } = require('../utils/uploader');
const { convertSecondsToDuration } = require("../utils/secToDuration")
const CourseProgress = require("../models/courseProgress")
/**
 * Update user profile details
 * Updates about, contact, gender, and DOB fields for the user's profile
 */
exports.updateProfile = async (req, res) => {
    try {
        // Fetch updatable fields from request body
        const { about, gender, DOB, contactNumber } = req.body;
        // Get user id from request (set by auth middleware)
        const id = req.user.id;

        // Fetch user and profile details
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // Update only the provided profile fields
        if (typeof DOB !== "undefined") profileDetails.DOB = DOB;
        if (typeof gender !== "undefined") profileDetails.gender = gender;
        if (typeof about !== "undefined") profileDetails.about = about;
        if (typeof contactNumber !== "undefined") profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            profileDetails
        });

    } catch (err) {
        // Log error and return failure response
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating profile."
        });
    }
};

/**
 * Delete a user account and clean up related data
 * Removes user, their profile, and unenrolls them from all courses
 */
exports.deleteAccount = async (req, res) => {
    try {
        // Get user id from auth middleware
        const id = req.user.id;

        // Check if user exists
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "User does not exist."
            });
        }

        // Delete user's profile
        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        // Remove user from all courses' studentsEnrolled arrays
        await Course.updateMany(
            { studentsEnrolled: id },
            { $pull: { studentsEnrolled: id } }
        );

        // Delete user
        await User.findByIdAndDelete(id);

        // Return success response
        return res.status(200).json({
            success: true,
            message: "User deleted successfully."
        });
    } catch (err) {
        // Log error and return failure response
        console.log(err);
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting account."
        });
    }
};

/**
 * Fetch user details with populated profile
 * Returns user data along with additional profile details
 */
exports.userDetails = async (req, res) => {
    try {
        // Get user id from request (set by auth middleware)
        const id = req.user.id;

        // Fetch user details and populate profile
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // Return success response
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully.",
            userDetails
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching user details."
        });
    }
};

exports.getUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        console.log("Fetching enrolled courses for userId:", userId)
        
        let userDetails = await User.findOne({
            _id: userId,
        })
        .populate({
            path: "courses",
            populate: [
                {
                    path: "instructor",
                    select: "firstName lastName"
                },
                {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                }
            ]
        })
        .exec()

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userId}`,
            })
        }

        console.log("User details found, courses count:", userDetails.courses.length)

        // Calculate progress for each course
        const coursesWithProgress = await Promise.all(
            userDetails.courses.map(async (course) => {
                let totalDurationInSeconds = 0
                let totalSubsections = 0

                // Calculate total duration and subsections
                if (course.courseContent && course.courseContent.length > 0) {
                    course.courseContent.forEach((content) => {
                        if (content.subSection && content.subSection.length > 0) {
                            content.subSection.forEach((subSection) => {
                                const timeDurationInSeconds = parseInt(subSection.timeDuration) || 0
                                totalDurationInSeconds += timeDurationInSeconds
                                totalSubsections += 1
                            })
                        }
                    })
                }

                // Find course progress for this user and course
                let courseProgressCount = await CourseProgress.findOne({
                    courseId: course._id,
                    userId: userId,
                })

                let progressPercentage = 0
                if (courseProgressCount && totalSubsections > 0) {
                    progressPercentage = Math.round(
                        (courseProgressCount.completedVideos.length / totalSubsections) * 100
                    )
                }

                console.log(`Course: ${course.courseName}, ID: ${course._id}, Progress: ${progressPercentage}%`)

                return {
                    _id: course._id,
                    courseName: course.courseName,
                    courseDescription: course.courseDescription,
                    thumbnail: course.thumbnail,
                    instructor: course.instructor,
                    courseContent: course.courseContent,
                    status: course.status,
                    totalDuration: convertSecondsToDuration(totalDurationInSeconds),
                    progressPercentage: progressPercentage,
                }
            })
        )

        console.log("Returning courses with progress:", coursesWithProgress.length)

        return res.status(200).json({
            success: true,
            data: coursesWithProgress,
        })
    } catch (error) {
        console.log("GET_ENROLLED_COURSES_ERROR:", error)
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course?.studentsEnrolled?.length
      const totalAmountGenerated = totalStudentsEnrolled * course?.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course?.courseName,
        courseDescription: course?.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
}
