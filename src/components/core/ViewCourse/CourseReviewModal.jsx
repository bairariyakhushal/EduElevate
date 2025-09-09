import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { RxCross2 } from "react-icons/rx"
import { useSelector, useDispatch } from "react-redux"

import { createRating, getFullDetailsOfCourse } from "../../../services/operations/courseDetailsAPI"
import { setEntireCourseData } from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"

// Custom Star Rating Component with Enhanced Hover Effects
const StarRating = ({ rating, onRatingChange, size = 28 }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (clickedRating) => {
    onRatingChange(clickedRating)
  }

  const handleMouseEnter = (hoveredRating) => {
    setHoverRating(hoveredRating)
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoverRating || rating)
        const isHovered = star <= hoverRating
        
        return (
          <button
            key={star}
            type="button"
            className={`
              focus:outline-none transition-all duration-200 ease-in-out transform
              ${isHovered ? 'scale-110' : 'scale-100'}
              hover:scale-110
            `}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            style={{
              fontSize: `${size}px`,
              color: isActive 
                ? isHovered 
                  ? '#fbbf24'  // Brighter gold on hover
                  : '#fcd34d'  // Regular gold when selected
                : hoverRating >= star
                  ? '#f3f4f6'  // Light gray when hovering over upcoming stars
                  : '#6b7280', // Dark gray for unselected
              textShadow: isActive ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none',
              filter: isActive ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.4))' : 'none',
            }}
          >
            ★
          </button>
        )
      })}
      
      {/* Rating Text Display */}
      <span className="ml-3 text-sm text-richblack-200 min-w-[80px]">
        {hoverRating ? (
          <span className="text-yellow-400 font-medium">
            {hoverRating} star{hoverRating !== 1 ? 's' : ''}
          </span>
        ) : rating ? (
          <span className="text-richblack-100">
            {rating} star{rating !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-richblack-400">
            Select rating
          </span>
        )}
      </span>
    </div>
  )
}

export default function CourseReviewModal({ setReviewModal }) {
  const dispatch = useDispatch()
  const [currentRating, setCurrentRating] = useState(0)
  
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { courseEntireData } = useSelector((state) => state?.viewCourse) || {};

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    setValue("courseExperience", "")
    setValue("courseRating", 0)
  }, [setValue])

  if (!courseEntireData) {
    return null;
  }

  const handleRatingChange = (newRating) => {
    setCurrentRating(newRating)
    setValue("courseRating", newRating)
  }

  const onSubmit = async (data) => {
    // Validate that user has selected a rating
    if (data.courseRating === 0) {
      alert("Please select a star rating before submitting")
      return
    }

    try {
      const success = await createRating(
        {
          courseId: courseEntireData._id,
          rating: data.courseRating,
          review: data.courseExperience,
        },
        token
      )
      
      if (success) {
        const updatedCourseData = await getFullDetailsOfCourse(courseEntireData._id, token)
        
        if (updatedCourseData) {
          dispatch(setEntireCourseData(updatedCourseData.courseDetails))
        }
      }
      
      setReviewModal(false)
    } catch (error) {
      console.error("Error creating rating:", error)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5 border-b border-richblack-600">
          <p className="text-xl font-semibold text-richblack-5">Add Review</p>
          <button 
            onClick={() => setReviewModal(false)}
            className="hover:bg-richblack-600 p-1 rounded transition-colors"
          >
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          
          {/* User Info */}
          <div className="flex items-center justify-center gap-x-4 mb-6">
            <img
              src={user?.image}
              alt={`${user?.firstName} profile`}
              className="aspect-square w-[50px] rounded-full object-cover border-2 border-richblack-600"
            />
            <div>
              <p className="font-semibold text-richblack-5 text-lg">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-300">Posting Publicly</p>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Star Rating Section */}
            <div className="flex flex-col items-center">
              <p className="text-richblack-5 text-sm mb-2 font-medium">Rate this course</p>
              <div className="bg-richblack-700 rounded-lg p-4 border border-richblack-600">
                <StarRating 
                  rating={currentRating} 
                  onRatingChange={handleRatingChange}
                  size={32}
                />
              </div>
            </div>
            
            {/* Review Text Area */}
            <div className="space-y-2">
              <label
                className="text-sm text-richblack-5 font-medium"
                htmlFor="courseExperience"
              >
                Share your experience <sup className="text-pink-200">*</sup>
              </label>
              
              <textarea
                id="courseExperience"
                placeholder="Tell others about your experience with this course..."
                {...register("courseExperience", { 
                  required: "Please share your experience",
                  minLength: {
                    value: 10,
                    message: "Review must be at least 10 characters long"
                  }
                })}
                className="w-full min-h-[120px] p-4 rounded-lg border border-richblack-600 bg-richblack-700 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50 focus:border-transparent resize-none transition-all duration-200"
                style={{ 
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
              />
              
              {errors.courseExperience && (
                <span className="text-pink-200 text-xs font-medium flex items-center gap-1">
                  <span className="text-pink-200">⚠</span>
                  {errors.courseExperience.message}
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setReviewModal(false)}
                className="px-6 py-2 rounded-md bg-richblack-300 text-richblack-900 font-semibold hover:bg-richblack-200 transition-colors duration-200"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={currentRating === 0}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                  currentRating === 0
                    ? 'bg-richblack-600 text-richblack-400 cursor-not-allowed'
                    : 'bg-yellow-50 text-richblack-900 hover:bg-yellow-25 hover:scale-105 shadow-lg hover:shadow-yellow-50/20'
                }`}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}