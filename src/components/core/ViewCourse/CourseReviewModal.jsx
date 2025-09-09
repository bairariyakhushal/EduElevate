import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { RxCross2 } from "react-icons/rx"
import ReactStars from "react-rating-stars-component"
import { useSelector, useDispatch } from "react-redux"

import { createRating, getFullDetailsOfCourse } from "../../../services/operations/courseDetailsAPI"
import { setEntireCourseData } from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"

export default function CourseReviewModal({ setReviewModal }) {
  const dispatch = useDispatch()
  
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
    
    // Debug logs
    console.log("ReactStars component:", ReactStars)
    console.log("Is ReactStars available?", typeof ReactStars)
  }, [setValue])

  if (!courseEntireData) {
    return null;
  }

  const ratingChanged = (newRating) => {
    console.log("Rating changed to:", newRating)
    setValue("courseRating", newRating)
  }

  const onSubmit = async (data) => {
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
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">Add Review</p>
          <button onClick={() => setReviewModal(false)}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center gap-x-4">
            <img
              src={user?.image}
              alt={user?.firstName + "profile"}
              className="aspect-square w-[50px] rounded-full object-cover"
            />
            <div className="">
              <p className="font-semibold text-richblack-5">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-5">Posting Publicly</p>
            </div>
          </div>
          
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col items-center"
          >
            {/* Debug container for star rating */}
            <div className="mb-4 w-full flex flex-col items-center">
              <p className="text-white text-sm mb-2">Star Rating:</p>
              
              {/* Add visible border to see if component is rendering */}
              <div 
                className="p-4 border-2 border-yellow-400 rounded bg-gray-700"
                style={{ minHeight: '50px', minWidth: '200px' }}
              >
                {ReactStars ? (
                  <ReactStars
                    count={5}
                    onChange={ratingChanged}
                    size={30}  // Make bigger to see
                    activeColor="#ffd700"
                    color="#6b7280"  // Gray color for empty stars
                    value={0}
                    edit={true}
                    isHalf={false}
                  />
                ) : (
                  <p className="text-red-500">ReactStars component not loaded</p>
                )}
              </div>
              
              {/* Fallback star rating using buttons */}
              <div className="mt-4 flex gap-1">
                <p className="text-white text-sm mr-2">Fallback Stars:</p>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => ratingChanged(star)}
                    className="text-2xl hover:text-yellow-400 text-gray-400"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex w-11/12 flex-col space-y-2">
              <label
                className="text-sm text-richblack-5"
                htmlFor="courseExperience"
              >
                Add Your Experience <sup className="text-pink-200">*</sup>
              </label>
              
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
              
              {errors.courseExperience && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                  Please Add Your Experience
                </span>
              )}
            </div>
            
            <div className="mt-6 flex w-11/12 justify-end gap-x-2">
              <button
                type="button"
                onClick={() => setReviewModal(false)}
                className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
              >
                Cancel
              </button>
              
              <IconBtn text="Save" />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}