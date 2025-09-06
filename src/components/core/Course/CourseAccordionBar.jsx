import { useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"

import CourseSubSectionAccordion from "./CourseSubSectionAccordion"

/**
 * CourseAccordionBar Component
 * Renders an expandable/collapsible section for course content
 * 
 * @param {Object} course - Course section data containing sectionName and subSection array
 * @param {Array} isActive - Array of active/expanded section IDs from parent component
 * @param {Function} handleActive - Function to toggle section expand/collapse state
 */
export default function CourseAccordionBar({ course, isActive, handleActive }) {
  // Ref to access the content element for height calculations
  const contentEl = useRef(null)

  // Local state to track if this specific accordion section is active/expanded
  const [active, setActive] = useState(false)

  // Update local active state when parent's isActive array changes
  useEffect(() => {
    setActive(isActive?.includes(course._id))
  }, [isActive])

  // State to control the height of the accordion content for smooth animations
  const [sectionHeight, setSectionHeight] = useState(0)

  // Calculate and set the height of content based on active state
  useEffect(() => {
    // If active, set height to full scroll height, otherwise collapse to 0
    setSectionHeight(active ? contentEl.current.scrollHeight : 0)
  }, [active])

  return (
    <div className="overflow-hidden border border-solid border-richblack-600 bg-richblack-700 text-richblack-5 last:mb-0">
      
      {/* Accordion Header - Always visible, clickable to toggle */}
      <div>
        <div
          className={`flex cursor-pointer items-start justify-between bg-opacity-20 px-7 py-6 transition-[0.3s]`}
          onClick={() => {
            // Toggle this section's active state via parent handler
            handleActive(course._id)
          }}
        >
          
          {/* Left side: Arrow icon and section name */}
          <div className="flex items-center gap-2">
            {/* Rotating arrow icon based on active state */}
            <i
              className={
                isActive.includes(course._id) ? "rotate-180" : "rotate-0"
              }
            >
              <AiOutlineDown />
            </i>
            {/* Section name/title */}
            <p>{course?.sectionName}</p>
          </div>

          {/* Right side: Lecture count display */}
          <div className="space-x-4">
            <span className="text-yellow-25">
              {`${course.subSection.length || 0} 
                ${course.subSection.length === 1 ? "Lecture" : "Lectures"}
              `}
            </span>
          </div>
        </div>
      </div>

      {/* Accordion Content - Expandable section containing subsections */}
      <div
        ref={contentEl}
        className={`relative h-0 overflow-hidden bg-richblack-900 transition-[height] duration-[0.35s] ease-[ease]`}
        style={{
          // Dynamic height for smooth expand/collapse animation
          height: sectionHeight,
        }}
      >
        {/* Content container with padding */}
        <div className="text-textHead flex flex-col gap-2 px-7 py-6 font-semibold">
          {/* Render each subsection/lecture within this section */}
          {course?.subSection?.map((subSec, i) => {
            return <CourseSubSectionAccordion subSec={subSec} key={i} />
          })}
        </div>
      </div>
    </div>
  )
}