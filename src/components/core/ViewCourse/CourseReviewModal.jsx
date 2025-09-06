import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { RxCross2 } from "react-icons/rx"
import ReactStars from "react-rating-stars-component"
import { useSelector, useDispatch } from "react-redux"

import { createRating, getFullDetailsOfCourse } from "../../../services/operations/courseDetailsAPI"
import { setEntireCourseData } from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"

/**
 * CourseReviewModal Component
 * 
 * Modal component that allows users to submit course reviews and ratings.
 * Features a star rating system and text review form with validation.
 * 
 * @param {Function} setReviewModal - Function to control modal visibility
 */
export default function CourseReviewModal({ setReviewModal }) {
  // Add dispatch
  const dispatch = useDispatch()
  
  // Get user profile data from Redux store
  const { user } = useSelector((state) => state.profile)
  
  // Get authentication token from Redux store
  const { token } = useSelector((state) => state.auth)
  
  // Get current course data from Redux store
  const { courseEntireData } = useSelector((state) => state?.viewCourse) || {};

  // React Hook Form setup for form handling and validation
  const {
    register,     // Register input fields for validation
    handleSubmit, // Handle form submission
    setValue,     // Programmatically set form values
    formState: { errors }, // Form validation errors
  } = useForm()

  /**
   * Initialize form with default values when component mounts
   * Sets empty review text and 0 star rating as defaults
   */
  useEffect(() => {
    setValue("courseExperience", "") // Initialize review text as empty
    setValue("courseRating", 0)      // Initialize rating as 0 stars
    
    // Disable exhaustive-deps as we only want this to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Early return AFTER all hooks are called
  if (!courseEntireData) {
    return null; // or a loading indicator
  }

  /**
   * Handle star rating changes
   * Updates form value when user clicks on stars
   * 
   * @param {number} newRating - New rating value (1-5 stars)
   */
  const ratingChanged = (newRating) => {
    setValue("courseRating", newRating)
  }

  /**
   * Handle form submission
   * Sends review data to API, refreshes course data, and closes modal on success
   */
  const onSubmit = async (data) => {
    try {
      // Make API call to create course rating/review
      const success = await createRating(
        {
          courseId: courseEntireData._id,
          rating: data.courseRating,
          review: data.courseExperience,
        },
        token
      )
      
      // If rating was created successfully, refresh course data
      if (success) {
        // Fetch updated course details
        const updatedCourseData = await getFullDetailsOfCourse(courseEntireData._id, token)
        
        if (updatedCourseData) {
          // Update Redux store with fresh course data
          dispatch(setEntireCourseData(updatedCourseData.courseDetails))
        }
      }
      
      // Close modal after successful submission
      setReviewModal(false)
    } catch (error) {
      console.error("Error creating rating:", error)
    }
  }

  return (
    // Modal backdrop with blur effect and overlay
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      
      {/* Modal container with dark theme styling */}
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        
        {/* Modal Header with title and close button */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">Add Review</p>
          
          {/* Close modal button */}
          <button onClick={() => setReviewModal(false)}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        
        {/* Modal Body with form content */}
        <div className="p-6">
          
          {/* User information display */}
          <div className="flex items-center justify-center gap-x-4">
            {/* User profile image */}
            <img
              src={user?.image}
              alt={user?.firstName + "profile"}
              className="aspect-square w-[50px] rounded-full object-cover"
            />
            
            {/* User name and privacy notice */}
            <div className="">
              <p className="font-semibold text-richblack-5">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-5">Posting Publicly</p>
            </div>
          </div>
          
          {/* Review form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            {/* Star rating component */}
            <ReactStars
              count={5}                    // 5-star rating system
              onChange={ratingChanged}     // Handle rating changes
              size={24}                    // Star size in pixels
              activeColor="#ffd700"        // Gold color for selected stars
            />
            
            {/* Review text area section */}
            <div className="flex w-11/12 flex-col space-y-2">
              {/* Label for textarea */}
              <label
                className="text-sm text-richblack-5"
                htmlFor="courseExperience"
              >
                Add Your Experience <sup className="text-pink-200">*</sup>
              </label>
              
              {/* Textarea for review text */}
              <textarea
                id="courseExperience"
                placeholder="Add Your Experience"
                {...register("courseExperience", { required: true })}
                className="w-full min-h-[130px] p-3 rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50 resize-none"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
                autoComplete="off"
                spellCheck="false"
              />
              
              {/* Error message for required validation */}
              {errors.courseExperience && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  Please Add Your Experience
                </span>
              )}
            </div>
            
            {/* Form action buttons */}
            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              {/* Cancel button - closes modal without saving */}
              <button
                onClick={() => setReviewModal(false)}
                className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
              >
                Cancel
              </button>
              
              {/* Save button - submits the form */}
              <IconBtn text="Save" />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}