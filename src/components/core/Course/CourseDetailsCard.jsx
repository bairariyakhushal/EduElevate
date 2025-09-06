import React from "react";
import copy from "copy-to-clipboard";
import { toast } from "react-hot-toast";
import { BsFillCaretRightFill } from "react-icons/bs";
import { FaShareSquare } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Redux actions and constants
import { addToCart } from "../../../slices/cartSlice";
import { ACCOUNT_TYPE } from "../../../utils/constants";

/**
 * CourseDetailsCard Component
 * Displays course purchase card with thumbnail, price, and action buttons
 *
 * @param {Object} course - Course object containing all course details
 * @param {Function} setConfirmationModal - Function to show confirmation modals
 * @param {Function} handleBuyCourse - Function to handle course purchase logic
 */

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  // Redux state selectors
  const { user } = useSelector((state) => state.profile); // Current logged-in user
  const { token } = useSelector((state) => state.auth); // Authentication token

  // React Router hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Destructure course properties with cleaner variable names
  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course;

  /**
   * Handle sharing course link
   * Copies current page URL to clipboard and shows success toast
   */
  const handleShare = () => {
    copy(window.location.href);
    toast.success("Link copied to clipboard");
  };

  /**
   * Handle adding course to cart
   * Includes validation for instructor accounts and login status
   */
  const handleAddToCart = () => {
    // Prevent instructors from buying courses
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.");
      return;
    }

    // If user is logged in, add to cart
    if (token) {
      dispatch(addToCart(course));
      return;
    }

    // If not logged in, show login confirmation modal
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  // Debug log for enrollment status
  console.log("Student already enrolled ", course?.studentsEnrolled, user?._id)

  return (
    <>
      {/* Main course card container */}
      <div
        className={`flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5`}
      >
        {/* Course thumbnail image */}
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />

        {/* Card content section */}
        <div className="px-4">
          {/* Course price display */}
          <div className="space-x-3 pb-4 text-3xl font-semibold">
            Rs. {CurrentPrice}
          </div>

          {/* Action buttons section */}
          <div className="flex flex-col gap-4">
            {/* Primary action button - Buy Now or Go To Course */}
            {/* Add to Cart button - only show if user is not enrolled */}
            {(!user || !course?.studentsEnrolled?.includes(user?._id)) && (
              <button
                onClick={handleAddToCart}
                className="bg-yellow-50 py-3 px-6 w-[336px] h-[48px] rounded-lg text-richblack-900 font-semibold"
              >
                Add to Cart
              </button>
            )}

            <button
              className="bg-richblack-800 py-3 px-6 w-[336px] h-[48px] rounded-lg font-semibold"
              onClick={
                // If user is enrolled, navigate to specific course, otherwise trigger purchase
                user && course?.studentsEnrolled?.includes(user?._id)
                  ? () => {
                      const firstSection = course?.courseContent?.[0];
                      const firstSubSection = firstSection?.subSection?.[0];
                      
                      if (!firstSection?._id || !firstSubSection?._id) {
                        console.error("Course structure is incomplete, navigating to basic course view");
                        navigate(`/view-course/${courseId}`);
                        return;
                      }
                      
                      navigate(`/view-course/${courseId}/section/${firstSection._id}/sub-section/${firstSubSection._id}`);
                    }
                  : handleBuyCourse
              }
            >
              {/* Dynamic button text based on enrollment status */}
              {user && course?.studentsEnrolled?.includes(user?._id)
                ? "Go To Course"
                : "Buy Now"}
            </button>
          </div>

          {/* Money-back guarantee section */}
          <div>
            <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
              30-Day Money-Back Guarantee
            </p>
          </div>

          {/* Course includes/features section */}
          <div className={``}>
            <p className={`my-2 text-xl font-semibold `}>
              Course Prerequisites :
            </p>

            {/* List of course features/instructions */}
            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
              {course?.instructions?.map((item, i) => {
                // Parse the JSON string if it's a string, otherwise use as is
                const prerequisiteArray = typeof item === 'string' ? JSON.parse(item) : item;
                return prerequisiteArray.map((prereq, index) => (
                  <p className={`flex gap-2`} key={`${i}-${index}`}>
                    {/* Bullet point icon */}
                    <BsFillCaretRightFill />
                    {/* Feature text */}
                    <span>{prereq}</span>
                  </p>
                ));
              })}
            </div>
          </div>

          {/* Share course section */}
          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-100 "
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetailsCard;
