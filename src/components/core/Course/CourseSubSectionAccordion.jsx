import React, { useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"
import { HiOutlineVideoCamera } from "react-icons/hi"

/**
 * CourseSubSectionAccordion Component
 * Renders individual lecture/subsection item within a course section
 * Displays video icon and lecture title in a simple row layout
 * 
 * @param {Object} subSec - Subsection/lecture object containing title and other details
 */
function CourseSubSectionAccordion({ subSec }) {
  return (
    <div>
      {/* Subsection/Lecture row container */}
      <div className="flex justify-between py-2">
        
        {/* Left side: Video icon and lecture title */}
        <div className={`flex items-center gap-2`}>
          {/* Video camera icon to indicate this is a video lecture */}
          <span>
            <HiOutlineVideoCamera />
          </span>
          
          {/* Lecture/subsection title */}
          <p>{subSec?.title}</p>
        </div>

        {/* Right side: Currently empty but could contain duration, status, etc. */}
        {/* This space could be used for lecture duration, completion status, or other metadata */}
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion