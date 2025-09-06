const Category = require('../models/category');
const Course = require("../models/course");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

/**
 * Create a new category
 * Validates input and creates a new category document
 */
exports.createCategory = async (req, res) => {
    try {
        // Fetch name and description from request body
        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Both name and description are required to create a category."
            });
        }

        // Create new category
        const categoryDetail = await Category.create({
            name,
            description
        });
        console.log(categoryDetail);

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Category created successfully.",
            categoryDetail
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to create category. Please try again later."
        });
    }
};

/**
 * Fetch all categories
 * Returns a list of all categories in the database
 */
exports.showAllCategorys = async (req, res) => {
    try {
        // Fetch all categories
        const allCategorys = await Category.find({});

        // Return success response
        return res.status(200).json({
            success: true,
            message: "All categories fetched successfully.",
            allCategorys
        });
    } catch (err) {
        // Log error and return failure response
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories. Please try again later."
        });
    }
};


//categoryPageDetails 
exports.categoryPageDetails = async (req, res) => {
    try {
        //get categoryId
        const { categoryId } = req.body;

        console.log("Category ID received:", categoryId);

        // Get Selected Category (without populate courses)
        const selectedCategory = await Category.findById(categoryId);

        if (!selectedCategory) {
            console.log("Category not found.")
            return res.status(404).json({
                success: false,
                message: 'Category Not Found',
            });
        }

        // Manually get courses for this category
        const coursesForSelectedCategory = await Course.find({
            category: categoryId,
            status: "Published"
        })
        .populate("ratingAndReview")
        .populate("instructor", "firstName lastName email")
        .exec();

        console.log("SELECTED CATEGORY COURSES:", coursesForSelectedCategory.length);

        // Handle the case when there are no courses
        if (coursesForSelectedCategory.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // Get Other Categories (except selected one)
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        });

        // Helper function for random int
        const getRandomInt = (max) => {
            return Math.floor(Math.random() * max);
        };

        // Get random different category
        let differentCategory = null;
        let coursesForDifferentCategory = [];

        if (categoriesExceptSelected.length > 0) {
            const randomCategoryIndex = getRandomInt(categoriesExceptSelected.length);
            differentCategory = categoriesExceptSelected[randomCategoryIndex];
            
            // Get courses for different category
            coursesForDifferentCategory = await Course.find({
                category: differentCategory._id,
                status: "Published"
            })
            .populate("ratingAndReview")
            .populate("instructor", "firstName lastName email")
            .limit(4)
            .exec();
        }

        // Get Most Selling Courses from all categories
        const mostSellingCourses = await Course.find({
            status: "Published"
        })
        .populate("ratingAndReview")
        .populate("instructor", "firstName lastName email")
        .sort({ studentsEnrolled: -1 }) // Sort by enrollment count
        .limit(10)
        .exec();

        console.log("Most selling courses count:", mostSellingCourses.length);

        // Prepare response data
        const responseData = {
            selectedCategory: {
                ...selectedCategory.toObject(),
                courses: coursesForSelectedCategory,
            },
            differentCategory: differentCategory ? {
                ...differentCategory.toObject(),
                courses: coursesForDifferentCategory,
            } : null,
            mostSellingCourses: mostSellingCourses,
        };

        res.status(200).json({
            success: true,
            data: responseData,
        });

    } catch (error) {
        console.log("Error in categoryPageDetails:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}