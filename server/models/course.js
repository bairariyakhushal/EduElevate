const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
    courseDescription: {
        type: String,
        required: true,

    },
    whatYouWillLearn: {
        type: String
    },
    price: {
        type: "Number",
        required: true
    },
    thumbnail: {
        type: String
    },
    tag:{
        type:[String],
        required:true
    },
    instructions:{
        type:[String]
    },
    status:{
        type:String,
        enum:["Draft","Published"]
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    ratingAndReview: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview"
        }
    ],
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
} , // Add timestamps for when the document is created and last modified
    { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);