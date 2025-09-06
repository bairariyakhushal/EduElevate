import { useState } from "react";
import { useForm } from "react-hook-form"; // Used for form handling with validation
import { toast } from "react-hot-toast"; // Used to show success/error messages
import { IoAddCircleOutline } from "react-icons/io5"; // Plus icon for adding sections
import { MdNavigateNext } from "react-icons/md"; // Next arrow icon
import { useDispatch, useSelector } from "react-redux"; // Redux hooks for state management

import {
  createSection, // API function to create new course section
  updateSection, // API function to update existing section name
} from "../../../../../services/operations/courseDetailsAPI";
import { getFullDetailsOfCourse, fetchCourseDetails } from "../../../../../services/operations/courseDetailsAPI";
import {
  setCourse, // Redux action to update course data
  setEditCourse, // Redux action to set edit mode
  setStep, // Redux action to change form step
} from "../../../../../slices/courseSlice";
import IconBtn from "../../../../Common/IconBtn"; // Reusable button component
import NestedView from "./NestedView"; // Component to display sections and subsections

// Main form component for building course structure (sections and lectures)
export default function CourseBuilderForm() {
  // React Hook Form setup for form handling
  const {
    register, // Function to register form inputs
    handleSubmit, // Function to handle form submission
    setValue, // Function to set form values programmatically
    formState: { errors }, // Form validation errors
  } = useForm();

  const { course } = useSelector((state) => state.course); // Course data from Redux
  const { token } = useSelector((state) => state.auth); // Authentication token from Redux
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [editSectionName, setEditSectionName] = useState(null); // Track which section is being edited
  const dispatch = useDispatch(); // Redux dispatch function

  // Handle form submission for creating/editing sections
  const onSubmit = async (data) => {
    // console.log(data)
    setLoading(true);

    let result;

    if (editSectionName) {
      // Update existing section name
      result = await updateSection(
        {
          sectionName: data.sectionName, // New section name
          sectionId: editSectionName, // ID of section to update
          courseId: course._id, // Course ID (to get populated course back)
        },
        token
      );
      // console.log("edit", result)
    } else {
      // Create new section
      result = await createSection(
        {
          sectionName: data.sectionName, // New section name
          courseId: course._id, // Course ID
        },
        token
      );
    }
    if (result) {
      // Backend returns populated course for both create and update
      dispatch(setCourse(result));
      setEditSectionName(null);
      setValue("sectionName", "");
    }
    setLoading(false);
  };

  // Cancel editing section name
  const cancelEdit = () => {
    setEditSectionName(null); // Exit edit mode
    setValue("sectionName", ""); // Clear form input
  };

  // Handle clicking edit button for section names
  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      // If clicking same section again, cancel edit
      cancelEdit();
      return;
    }
    // Enter edit mode for selected section
    setEditSectionName(sectionId);
    setValue("sectionName", sectionName); // Pre-fill with current name
  };

  // Validate and proceed to next step
  const goToNext = () => {
    if ((course?.courseContent?.length || 0) === 0) {
      toast.error("Please add atleast one section"); // Show error if no sections
      return;
    }
    if ((course?.courseContent || []).some((section) => (section?.subSection?.length || 0) === 0)) {
      toast.error("Please add atleast one lecture in each section"); // Show error if any section has no lectures
      return;
    }
    dispatch(setStep(3)); // Move to next step (publish course)
  };

  // Go back to previous step
  const goBack = () => {
    dispatch(setStep(1)); // Go back to course information step
    dispatch(setEditCourse(true)); // Enable edit mode
  };

  return (
    // Main container with dark theme and border
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>

      {/* Form for creating/editing sections */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Section Name Input Field */}
        <div className="flex flex-col space-y-2">
          <label
            className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5"
            htmlFor="sectionName"
          >
            Section Name <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading} // Disable during API calls
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })} // Required field validation
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.36)",
            }}
            className="w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
          />
          {/* Error message for required field */}
          {errors.sectionName && (
            <span className="ml-2 text-xs tracking-wide text-pink-200">
              Section name is required
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-x-4">
          <IconBtn
            type="submit"
            disabled={loading} // Disable during API calls
            text={editSectionName ? "Edit Section Name" : "Create Section"}
            outline={true} // Outline button style
          >
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </IconBtn>

          {/* Cancel Edit Button - Only show when editing */}
          {editSectionName && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-richblack-300 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Display existing sections and lectures */}
      {(course?.courseContent?.length || 0) > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-x-3">
        {/* Back Button */}
        <button
          onClick={goBack}
          className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}
        >
          Back
        </button>

        {/* Next Button */}
        <IconBtn disabled={loading} text="Next" onclick={goToNext} type="button">
          <MdNavigateNext />
        </IconBtn>
      </div>
    </div>
  );
}
