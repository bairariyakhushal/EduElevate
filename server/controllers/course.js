// Import required models and utilities
const Course = require('../models/course');
const Category = require('../models/category');
const Section = require('../models/section')
const SubSection = require('../models/subSection')
const User = require('../models/user')
const { uploadToCloudinary } = require('../utils/uploader');
const CourseProgress = require("../models/courseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

require("dotenv").config();

//Create Course
exports.createCourse = async (req, res) => {
    try {
        // Destructure required fields from request body
        let { courseName, courseDescription, whatYouWillLearn, price, category, status, instructions, tag } = req.body;
        // Get thumbnail image from files
        const thumbnail = req.files.thumbnailImage;

        // Validate all required fields
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !status || !instructions || !tag) {
            return res.status(400).json({
                success: false,
                message: "All fields are required to create a course."
            });
        }

        // Get user ID from request (assumed to be set by auth middleware)
        const userId = req.user.id;

        if (!status || status === undefined) {
            status = "Draft";
        }

        // Check if the user is an instructor
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details Not Found",
            });
        }

        // Check if category exists
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Category not found. Please select a valid category.",
            });
        }

        // Upload thumbnail image to Cloudinary
        const thumbnailImage = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Course duration will be calculated dynamically based on actual content

        // Create new course document
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions: instructions
        });

        // Add course to user's courses array
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true }
        );


        // Add course to category's courses array
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Course created successfully.",
            data: newCourse
        });

    } catch (err) {
        // Log error and return failure response
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to create course. Please try again later."
        });
    }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        //If thumbnail image found,update it
        if (req.files) {
            console.log("Thumbnail found")
            const thumbnail = req.files.thumbnailImage;
            const thumbnailImage = await uploadToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instruction") {
                    course[key] = JSON.parse(updates[key]);
                } else {
                    course[key] = updates[key]
                }
            }
        }

        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReview")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        res.json({
            success: true,
            message: "Course Updated Successfully",
            data: updatedCourse
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to update course. Please try again later.",
            error: error.message,
        })
    }
}

//Returns a list of all published courses.
exports.getAllCourses = async (req, res) => {
    try {
        // Fetch all courses
        const allCourses = await Course.find(
            {},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        )
            .populate("instructor")
            .exec();

        // Return success response with data
        return res.status(200).json({
            success: true,
            message: "Fetched all courses successfully.",
            data: allCourses
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses. Please try again later."
        });
    }
}

//Get Course Details
exports.getCourseDetails = async (req, res) => {
    try {
        //get id
        const { courseId } = req.body;
        //find course details
        const courseDetails = await Course.findOne({ _id: courseId })
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

        //validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }
        // Calculate total duration
        let totalDurationInSeconds = 0;
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration);
                totalDurationInSeconds += timeDurationInSeconds;
            });
        });

        // Convert total duration to readable format
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

        //return response
        return res.status(200).json({
            success: true,
            message: "Course Details fetched successfully",
            data: {
                courseDetails,
                totalDuration,
            },
            data: courseDetails,
        })

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//Returns full course details plus the user's progress (if logged in).
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReview")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                }
            })
            .exec();

        let courseProgressCount = await CourseProgress.findOne({
            courseId: courseId, // Changed from courseID to courseId
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

//Get Instructor Courses
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor with populated courseContent
        const instructorCourses = await Course.find({
            instructor: instructorId,
        })
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .sort({ createdAt: -1 })

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}

//Delete Course
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        } 

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}
