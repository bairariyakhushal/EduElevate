const RatingAndReview = require("../models/ratingAndReview");
const Course = require("../models/course");
const { mongo, default: mongoose } = require("mongoose");

// Create a new rating and review
exports.createRating = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { rating, review, courseId } = req.body;

        // Direct course fetch
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        // Manual enrollment check with string conversion
        const isEnrolled = course.studentsEnrolled.some(
            studentId => studentId.toString() === userId.toString()
        );

        console.log("Enrollment check:", {
            userId: userId.toString(),
            studentsEnrolled: course.studentsEnrolled.map(id => id.toString()),
            isEnrolled
        });

        if (!isEnrolled) {
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the course',
            });
        }


        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });
        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user',
            });
        }
        //create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });

        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            { _id: courseId },
            {
                $push: {
                    ratingAndReview: ratingReview._id,  // Changed from ratingAndReviews to ratingAndReview
                }
            },
            { new: true }
        );
        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get the average rating for a course
exports.getAverageRating = async (req, res) => {
    try {
        //get course ID
        const courseId = req.body.courseId;

        // Calculate the average rating using the MongoDB aggregation pipeline
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ])

        //return rating
        if (result.length > 0) {

            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })

        }

        //if no rating/Review exist
        return res.status(200).json({
            success: true,
            averageRating: 0,
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get all rating and reviews
exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
