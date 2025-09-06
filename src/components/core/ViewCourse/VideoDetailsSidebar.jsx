import { useEffect, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"

import IconBtn from "../../Common/IconBtn"

/**
 * VideoDetailsSidebar Component
 * 
 * Displays course navigation sidebar with sections, subsections, and progress tracking.
 * Allows users to navigate between course videos and track completion status.
 * 
 * @param {Function} setReviewModal - Function to toggle the course review modal
 */
export default function VideoDetailsSidebar({ setReviewModal }) {
  // State for tracking which course section is expanded/active
  const [activeStatus, setActiveStatus] = useState("")
  
  // State for tracking which video/subsection is currently selected
  const [videoBarActive, setVideoBarActive] = useState("")
  
  // Navigation hook for programmatic routing
  const navigate = useNavigate()
  
  // Current location object for tracking route changes
  const location = useLocation()
  
  // Extract sectionId and subSectionId from URL parameters
  const { sectionId, subSectionId } = useParams()
  
  // Get course data from Redux store
  const {
    courseSectionData,    // Array of course sections with subsections
    courseEntireData,     // Complete course information
    totalNoOfLectures,    // Total count of all lectures in course
    completedLectures,    // Array of completed lecture IDs
  } = useSelector((state) => state.viewCourse || {})

  /**
   * Effect to set active section and video based on current URL parameters
   * Runs when courseSectionData, courseEntireData, or route changes
   */
  useEffect(() => {
    // IIFE to handle the active state logic
    ;(() => {
      // Exit early if no course data is available
      if (!courseSectionData?.length) return
      
      // Find the index of current section based on URL sectionId
      const currentSectionIndx = courseSectionData.findIndex(
        (data) => data._id === sectionId
      )
      
      // Find the index of current subsection within the found section
      const currentSubSectionIndx = courseSectionData?.[
        currentSectionIndx
      ]?.subSection.findIndex((data) => data._id === subSectionId)
      
      // Get the active subsection ID from the found indices
      const activeSubSectionId =
        courseSectionData[currentSectionIndx]?.subSection?.[
          currentSubSectionIndx
        ]?._id
      
      // Update state to reflect current active section and video
      setActiveStatus(courseSectionData?.[currentSectionIndx]?._id)
      setVideoBarActive(activeSubSectionId)
    })()
    
    // Disable exhaustive-deps as we want controlled dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSectionData, courseEntireData, location?.pathname])

    
  
    return (
    <>
      {/* Main sidebar container with fixed width and dark theme */}
      <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
        
        {/* Sidebar header with navigation and course info */}
        <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
          
          {/* Top row: Back button and Add Review button */}
          <div className="flex w-full items-center justify-between ">
            {/* Back button to return to enrolled courses page */}
            <div
              onClick={() => {
                navigate(`/dashboard/enrolled-courses`)
              }}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
              title="back"
            >
              <IoIosArrowBack size={30} />
            </div>
            
            {/* Add Review button */}
            <IconBtn
              text="Add Review"
              customClasses="ml-auto"
              onclick={() => setReviewModal(true)}
            />
          </div>
          
          {/* Course information display */}
          <div className="flex flex-col">
            {/* Course title */}
            <p>{courseEntireData?.courseName}</p>
            {/* Progress indicator: completed/total lectures */}
            <p className="text-sm font-semibold text-richblack-500">
              {completedLectures?.length} / {totalNoOfLectures}
            </p>
          </div>
        </div>

        {/* Scrollable course content area */}
        <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
          {/* Map through each course section */}
          {courseSectionData?.map((section, index) => (
            <div
              className="mt-2 cursor-pointer text-sm text-richblack-5"
              onClick={() => setActiveStatus(section?._id)}
              key={index}
            >
              {/* Section header with title and expand/collapse icon */}
              <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                {/* Section name */}
                <div className="w-[70%] font-semibold">
                  {section?.sectionName}
                </div>
                
                {/* Right side: lesson count and chevron icon */}
                <div className="flex items-center gap-3">
                  {/* Lesson count (commented out) */}
                  {/* <span className="text-[12px] font-medium">
                    Lession {course?.subSection.length}
                  </span> */}
                  
                  {/* Expandable chevron icon - rotates based on section state */}
                  <span
                    className={`${
                      activeStatus === section?._id
                        ? "rotate-0"
                        : "rotate-180"
                    } transition-all duration-500`}
                  >
                    <BsChevronDown />
                  </span>
                </div>
              </div>

              {/* Expandable subsections - only show when section is active */}
              {activeStatus === section?._id && (
                <div className="transition-[height] duration-500 ease-in-out">
                  {/* Map through each subsection/video in the current section */}
                  {(section.subSection || []).map((topic, i) => (
                    <div
                      className={`flex gap-3  px-5 py-2 ${
                        videoBarActive === topic._id
                          ? "bg-yellow-200 font-semibold text-richblack-800" // Active video styling
                          : "hover:bg-richblack-900" // Hover styling for inactive videos
                      } `}
                      key={i}
                      onClick={() => {
                        // Navigate to specific video URL
                        navigate(
                          `/view-course/${courseEntireData?._id}/section/${section?._id}/sub-section/${topic?._id}`
                        )
                        // Set this video as active in the sidebar
                        setVideoBarActive(topic._id)
                      }}
                    >
                      {/* Completion checkbox - checked if lecture is completed */}
                      <input
                        type="checkbox"
                        checked={completedLectures.includes(topic?._id)}
                        onChange={() => {}} // Read-only checkbox, controlled by completion status
                      />
                      
                      {/* Video/lesson title */}
                      {topic.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}