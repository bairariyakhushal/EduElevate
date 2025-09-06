import { useEffect, useState } from "react"
import { useForm } from "react-hook-form" // Used for form handling with validation
import { toast } from "react-hot-toast" // Used to show success/error messages
import { RxCross2 } from "react-icons/rx" // Cross icon for closing modal
import { useDispatch, useSelector } from "react-redux" // Redux hooks for state management

import {
  createSubSection, // API function to create new subsection
  updateSubSection, // API function to update existing subsection
} from "../../../../../services/operations/courseDetailsAPI"

import { setCourse } from "../../../../../slices/courseSlice" // Redux action to update course state
import IconBtn from "../../../../Common/IconBtn" // Reusable button component
import Upload from "../Upload" // Video upload component

// Modal component for adding, viewing, and editing course subsections/lectures
export default function SubSectionModal({
  modalData, // Data passed to modal (sectionId for add, subsection data for view/edit)
  setModalData, // Function to close modal
  add = false, // Boolean to show if modal is in add mode
  view = false, // Boolean to show if modal is in view mode
  edit = false, // Boolean to show if modal is in edit mode
}) {
  // React Hook Form setup for form handling
  const {
    register, // Function to register form inputs
    handleSubmit, // Function to handle form submission
    setValue, // Function to set form values programmatically
    formState: { errors }, // Form validation errors
    getValues, // Function to get current form values
  } = useForm()

  // console.log("view", view)
  // console.log("edit", edit)
  // console.log("add", add)

  const dispatch = useDispatch() // Redux dispatch function
  const [loading, setLoading] = useState(false) // Loading state for API calls
  const { token } = useSelector((state) => state.auth) // Authentication token from Redux
  const { course } = useSelector((state) => state.course) // Course data from Redux

  // Set form values when modal opens in view or edit mode
  useEffect(() => {
    if (view || edit) {
      // console.log("modalData", modalData)
      setValue("lectureTitle", modalData.title) // Set lecture title
      setValue("lectureDesc", modalData.description) // Set lecture description
      setValue("lectureVideo", modalData.videoUrl) // Set lecture video URL
    }
  }, [])

  // Check if form has been modified during editing
  const isFormUpdated = () => {
    const currentValues = getValues()
    // console.log("changes after editing form values:", currentValues)
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    ) {
      return true // Form has been modified
    }
    return false // No changes made
  }

  // Handle updating an existing subsection
  const handleEditSubsection = async () => {
    const currentValues = getValues()
    // console.log("changes after editing form values:", currentValues)
    const formData = new FormData() // FormData for file uploads
    // console.log("Values After Editing form values:", currentValues)
    formData.append("sectionId", modalData.sectionId) // Section ID where subsection belongs
    formData.append("subSectionId", modalData._id) // ID of subsection being edited
    
    // Only append changed fields to avoid unnecessary updates
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle)
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc)
    }
    if (currentValues.lectureVideo && currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo)
    }
    
    setLoading(true)
    const result = await updateSubSection(formData, token)
    if (result) {
      // console.log("result", result)
      // Update the course structure in Redux store
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null) // Close modal
    setLoading(false)
  }

  // Handle form submission for all modes (add, edit, view)
  const onSubmit = async (data) => {
    // console.log(data)
    if (view) return // Don't submit if just viewing

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form") // Show error if no changes
      } else {
        handleEditSubsection() // Handle editing
      }
      return
    }

    // Handle adding new subsection
    const formData = new FormData()
    formData.append("sectionId", modalData) // Section ID where to add subsection
    formData.append("title", data.lectureTitle) // Lecture title
    formData.append("description", data.lectureDesc) // Lecture description
    formData.append("video", data.lectureVideo) // Lecture video file
    
    setLoading(true)
    const result = await createSubSection(formData, token)
    if (result) {
      // Update course structure in Redux store
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null) // Close modal
    setLoading(false)
  }

  return (
    // Modal overlay with backdrop blur effect
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      {/* Modal container with dark theme */}
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header with title and close button */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          {/* Close button - disabled during loading */}
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        {/* Modal Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-8 py-10"
        >
          {/* Video upload component for lecture video */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true} // Indicates this is for video upload
            viewData={view ? modalData.videoUrl : null} // Show video URL in view mode
            editData={edit ? modalData.videoUrl : null} // Show current video in edit mode
          />
          {/* Lecture Title Input Field */}
          <div className="flex flex-col space-y-2">
            <label className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading} // Disable in view mode or during loading
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })} // Required field validation
              style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.36)",
          }}
          className="w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
            />
            {/* Error message for required field */}
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>

          {/* Lecture Description Textarea */}
          <div className="flex flex-col space-y-2">
            <label className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5" htmlFor="lectureDesc">
              Lecture Description{" "}
              {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading} // Disable in view mode or during loading
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })} // Required field validation
              style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.36)",
          }}
          className="w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
            />
            {/* Error message for required field */}
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Description is required
              </span>
            )}
          </div>
          
          {/* Submit Button - Only show if not in view mode */}
          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading} // Disable during API calls
                text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
