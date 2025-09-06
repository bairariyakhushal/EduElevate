import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams } from "react-router-dom"

import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar"
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice"

/**
 * ViewCourse Component
 * 
 * Main component for displaying course content with video player and sidebar navigation.
 * Handles course data fetching, state management, and layout for the course viewing experience.
 */
export default function ViewCourse() {
  // Extract courseId from URL parameters
  const { courseId } = useParams()
  
  // Get authentication token from Redux store
  const { token } = useSelector((state) => state.auth)
  
  // Redux dispatch function for state updates
  const dispatch = useDispatch()
  
  // Local state for controlling the course review modal visibility
  const [reviewModal, setReviewModal] = useState(false)

  /**
   * Effect hook to fetch and initialize course data when component mounts
   * Runs once on component mount to load all course-related information
   */
  useEffect(() => {
    // Use IIFE (Immediately Invoked Function Expression) to handle async operations
    ;(async () => {
      try {
        console.log("Fetching course data for courseId:", courseId);
        const courseData = await getFullDetailsOfCourse(courseId, token);
        console.log("View Course me courseData...", courseData);
        
        if (!courseData) throw new Error('Failed to fetch course data');

        // Dispatch course data to Redux store
        dispatch(setCourseSectionData(courseData.courseDetails?.courseContent));
        console.log("View Course me CourseSectionData...", courseData.courseDetails?.courseContent);

        dispatch(setEntireCourseData(courseData?.courseDetails));
        console.log("View Course me EntireCourseData ", courseData?.courseDetails);
        
        dispatch(setCompletedLectures(courseData?.completedVideos));
        console.log("View Course me CompletedVideos...", courseData?.completedVideos);

        // Calculate total number of lectures across all sections
        let lectures = 0;
        courseData?.courseDetails?.courseContent?.forEach((sec) => {
          lectures += sec.subSection.length;
        });
        dispatch(setTotalNoOfLectures(lectures));
        console.log("View Course me TotalNoOfLectures...", lectures);
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    })()
    
  }, [courseId, token, dispatch])

  return (
    <>
      {/* Main course viewing container */}
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        {/* Left sidebar containing course navigation and video details */}
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
        
        {/* Main content area for video player and course materials */}
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6">
            {/* Nested routes render here (video player, assignments, etc.) */}
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Conditionally render course review modal */}
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}