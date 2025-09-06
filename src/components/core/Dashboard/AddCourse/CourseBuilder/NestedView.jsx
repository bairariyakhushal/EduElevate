import { useState } from "react"
import { AiFillCaretDown } from "react-icons/ai" // Dropdown arrow icon
import { FaPlus } from "react-icons/fa" // Plus icon for adding lectures
import { MdEdit } from "react-icons/md" // Edit icon
import { RiDeleteBin6Line } from "react-icons/ri" // Delete icon
import { RxDropdownMenu } from "react-icons/rx" // Menu icon for sections
import { useDispatch, useSelector } from "react-redux" // Redux hooks for state management

import {
  deleteSection, // API function to delete course section
  deleteSubSection, // API function to delete subsection/lecture
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice" // Redux action to update course state
import ConfirmationModal from "../../../../Common/ConfirmationModal" // Modal for confirming deletions
import SubSectionModal from "./SubSectionModal" // Modal for adding/editing/viewing lectures

// Component to display course structure with nested sections and lectures
export default function NestedView({ handleChangeEditSectionName }) {
  const { course } = useSelector((state) => state.course) // Course data from Redux
  const { token } = useSelector((state) => state.auth) // Authentication token from Redux
  const dispatch = useDispatch() // Redux dispatch function
  
  // States to keep track of mode of modal [add, view, edit]
  const [addSubSection, setAddSubsection] = useState(null) // Track which section to add lecture to
  const [viewSubSection, setViewSubSection] = useState(null) // Track which lecture to view
  const [editSubSection, setEditSubSection] = useState(null) // Track which lecture to edit
  
  // State to keep track of confirmation modal for deletions
  const [confirmationModal, setConfirmationModal] = useState(null)

  // Handle deleting an entire section (will delete all lectures in it)
  const handleDeleleSection = async (sectionId) => {
    if (!token) {
      setConfirmationModal(null)
      return
    }
    const result = await deleteSection({
      sectionId, // ID of section to delete
      courseId: course._id, // Course ID
    }, token)
    if (result) {
      dispatch(setCourse(result)) // Update course in Redux store
    } else {
      // Backend returned only success message; optimistically update state
      const filtered = (course?.courseContent || []).filter((sec) => sec._id !== sectionId)
      dispatch(setCourse({ ...course, courseContent: filtered }))
    }
    setConfirmationModal(null) // Close confirmation modal
  }

  // Handle deleting a specific lecture/subsection
  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    if (!token) return
    const result = await deleteSubSection({ subSectionId, sectionId }, token)
    if (result) {
      // Update the course structure in Redux store
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    } else {
      // optimistic: remove locally if backend not returning section
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId
          ? { ...section, subSection: (section.subSection || []).filter((s) => s._id !== subSectionId) }
          : section
      )
      dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
    }
    setConfirmationModal(null) // Close confirmation modal
  }

  return (
    <>
      {/* Main container for displaying course structure */}
      <div
        className="rounded-lg bg-richblack-700 p-6 px-8"
        id="nestedViewContainer"
      >
        {/* Map through all course sections */}
        {(course?.courseContent || [])?.map((section, idx) => (
          // Section Dropdown - Each section is a collapsible details element
          <details key={section?._id || `section-${idx}`} open>
            {/* Section Header with dropdown arrow */}
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-richblack-50" />
                <p className="font-semibold text-richblack-50">
                  {section.sectionName}
                </p>
              </div>
              
              {/* Section Action Buttons */}
              <div className="flex items-center gap-x-3">
                {/* Edit Section Name Button */}
                <button
                  onClick={() =>
                    handleChangeEditSectionName(
                      section._id,
                      section.sectionName
                    )
                  }
                >
                  <MdEdit className="text-xl text-richblack-300" />
                </button>
                
                {/* Delete Section Button */}
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete this Section?", // Confirmation question
                      text2: "All the lectures in this section will be deleted", // Warning message
                      btn1Text: "Delete", // Delete button text
                      btn2Text: "Cancel", // Cancel button text
                      btn1Handler: () => handleDeleleSection(section._id), // Delete function
                      btn2Handler: () => setConfirmationModal(null), // Cancel function
                    })
                  }
                >
                  <RiDeleteBin6Line className="text-xl text-richblack-300" />
                </button>
                
                <span className="font-medium text-richblack-300">|</span>
                <AiFillCaretDown className={`text-xl text-richblack-300`} />
              </div>
            </summary>
            
            {/* Section Content - All lectures within this section */}
            <div className="px-6 pb-4">
              {/* Map through all lectures in this section */}
              {(section?.subSection || []).map((data, sidx) => (
                <div
                  key={data?._id || `sub-${sidx}`}
                  onClick={() => setViewSubSection(data)} // Click to view lecture details
                  className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                >
                  {/* Lecture Information */}
                  <div className="flex items-center gap-x-3 py-2 ">
                    <RxDropdownMenu className="text-2xl text-richblack-50" />
                    <p className="font-semibold text-richblack-50">
                      {data.title}
                    </p>
                  </div>
                  
                  {/* Lecture Action Buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()} // Prevent lecture view when clicking buttons
                    className="flex items-center gap-x-3"
                  >
                    {/* Edit Lecture Button */}
                    <button
                      onClick={() =>
                        setEditSubSection({ ...data, sectionId: section._id })
                      }
                    >
                      <MdEdit className="text-xl text-richblack-300" />
                    </button>
                    
                    {/* Delete Lecture Button */}
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Delete this Sub-Section?", // Confirmation question
                          text2: "This lecture will be deleted", // Warning message
                          btn1Text: "Delete", // Delete button text
                          btn2Text: "Cancel", // Cancel button text
                          btn1Handler: () =>
                            handleDeleteSubSection(data._id, section._id), // Delete function
                          btn2Handler: () => setConfirmationModal(null), // Cancel function
                        })
                      }
                    >
                      <RiDeleteBin6Line className="text-xl text-richblack-300" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add New Lecture Button for this section */}
              <button
                onClick={() => setAddSubsection(section._id)} // Set which section to add lecture to
                className="mt-3 flex items-center gap-x-1 text-yellow-50"
              >
                <FaPlus className="text-lg" />
                <p>Add Lecture</p>
              </button>
            </div>
          </details>
        ))}
      </div>
      
      {/* Modal Display - Show appropriate modal based on state */}
      {addSubSection ? (
        // Modal for adding new lecture
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubsection}
          add={true}
        />
      ) : viewSubSection ? (
        // Modal for viewing lecture details
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : editSubSection ? (
        // Modal for editing existing lecture
        <SubSectionModal
          modalData={editSubSection}
          setModalData={setEditSubSection}
          edit={true}
        />
      ) : (
        <></>
      )}
      
      {/* Confirmation Modal for deletions */}
      {confirmationModal ? (
        <ConfirmationModal modalData={confirmationModal} />
      ) : (
        <></>
      )}
    </>
  )
}
