const Course = require("../models/course");
const User = require('../models/user');
const { instance } = require('../config/razorpay');
const mailsender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
const mongoose = require("mongoose");
const crypto = require("crypto")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/courseProgress")


// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    const { courses } = req.body
    const userId = req.user.id;
    if (courses.length === 0) {
        return res.status(400).json({ success: false, message: "No courses selected for enrollment" })
    }

    let total_amount = 0;

    for (const course_id of courses) {
        let course
        try {
            course = await Course.findById(course_id)

            // If the course is not found, return an error
            if (!course) {
                return res.status(400).json({
                    success: false,
                    message: `Course not found for id ${course_id}`
                })
            }

            // Check if the user is already enrolled in the course
            const uid = new mongoose.Types.ObjectId(userId)
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(400).json({
                    success: false,
                    message: `User already enrolled for the course ${course.courseName}`
                })
            }

            // Add the price of the course to the total amount
            total_amount += course.price
        } catch (error) {
            console.error("Error fetching course:", error)
            return res.status(500).json({ success: false, message: error.message })
        }
    }

    const options = {
        amount: total_amount * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
    }

    try {
        // Initiate the payment using Razorpay
        const paymentResponse = await instance.orders.create(options)
        console.log(paymentResponse)
        res.json({
            success: true,
            data: paymentResponse
        })
    } catch (error) {
        console.error("Error initiating payment:", error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses

    const userId = req.user.id
    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
    ) {
        return res.status(200).json({
            success: false,
            message: "Payment verification failed"
        })
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac("sha256", process.env.REACT_APP_RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex")

    if (expectedSignature === razorpay_signature) {
        try {
            await enrollStudents(courses, userId)
            return res.status(200).json({ success: true, message: "Payment verified successfully" })
        } catch (error) {
            console.error("Error in payment verification:", error)
            return res.status(500).json({ success: false, message: "Failed to verify payment" })
        }
    }

    return res.status(400).json({ success: false, message: "Invalid signature sent!" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body

    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        })
    }

    try {
        const enrolledStudent = await User.findById(userId)

        await mailsender(
            enrolledStudent.email,
            `Payment Successfull`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            )
        )
    } catch (error) {
        console.error("Error sending payment success email:", error)
        return res.status(400).json({ success: false, message: error.message })
    }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId) => {
    if (!courses || !userId) {
        throw new Error("Courses or userId missing")
    }

    for (const courseId of courses) {
        try {
            // Find the course and enroll the student in it
            const enrolledCourse = await Course.findByIdAndUpdate(
                courseId,
                { $push: { studentsEnrolled: userId } },
                { new: true }
            )

            if (!enrolledCourse) {
                throw new Error(`Course not found for id ${courseId}`)
            }

            console.log("Updated Course: ", enrolledCourse)

            //Create a courseProgress to keep track of completed videos by user
            const courseProgress = await CourseProgress.create({
                courseId: courseId, 
                userId: userId,
                completedVideos: []
            })

            // Find the student and add the course to their list of enrolled courses
            const enrolledStudents = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id
                    },
                },
                { new: true }
            )

            console.log("Enrolled User: ", enrolledStudents)

            // Send an email notification to the enrolled student
            const emailResponse = await mailsender(
                enrolledStudents.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudents.firstName} ${enrolledStudents.lastName}`
                )
            )

            console.log("Email Response: ", emailResponse)
        } catch (error) {
            console.error("Error enrolling student in course:", error)
            throw error
        }
    }
}