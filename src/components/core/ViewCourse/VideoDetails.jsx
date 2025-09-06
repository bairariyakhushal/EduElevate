import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { useLocation } from "react-router-dom"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"

/**
 * VideoDetails Component
 * 
 * Main video player component that displays course videos with navigation controls,
 * completion tracking, and video management functionality.
 * Handles video playback, progress tracking, and navigation between lectures.
 */
const VideoDetails = () => {
  // Extract URL parameters for course navigation
  const { courseId, sectionId, subSectionId } = useParams()
  
  // Navigation and location hooks
  const navigate = useNavigate()
  const location = useLocation()
  
  // Reference to video player for programmatic control
  const playerRef = useRef(null)
  
  // Redux dispatch for state updates
  const dispatch = useDispatch()
  
  // Get authentication token from Redux store
  const { token } = useSelector((state) => state.auth)
  
  // Get course data from Redux store
const { courseSectionData, courseEntireData, completedLectures } =
  useSelector((state) => state.viewCourse || {})

  // Local component state
  const [videoData, setVideoData] = useState([])        // Current video information
  const [previewSource, setPreviewSource] = useState("") // Thumbnail/preview image
  const [videoEnded, setVideoEnded] = useState(false)    // Track if video has ended
  const [loading, setLoading] = useState(false)          // Loading state for async operations

  /**
   * Effect to load video data when URL parameters change
   * Filters course data to find the specific video based on sectionId and subSectionId
   */
  useEffect(() => {
    (async () => {
      console.log("VideoDetails useEffect - courseSectionData:", courseSectionData);
      console.log("VideoDetails useEffect - courseEntireData:", courseEntireData);
      
      // Exit early if no course sections are loaded
      if (!courseSectionData?.length) {
        console.log("No course sections available");
        return;
      }
      
      // Redirect to enrolled courses if required parameters are missing
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`);
      } else {
        // Find the current section data
        const filteredData = courseSectionData.filter(
          (section) => section._id === sectionId
        );
        console.log("Filtered section data:", filteredData);
        
        // Find the specific video/subsection within the section
        const filteredVideoData = filteredData?.[0]?.subSection?.filter(
          (data) => data._id === subSectionId
        );
        console.log("Filtered video data:", filteredVideoData);
        
        // Set the current video data and preview
        setVideoData(filteredVideoData?.[0]);
        setPreviewSource(courseEntireData?.thumbnail);
        setVideoEnded(false); // Reset video ended state when switching videos
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname, courseId, sectionId, subSectionId, navigate])

  /**
   * Check if current video is the first video of the entire course
   * Used to conditionally show/hide previous button
   * 
   * @returns {boolean} True if this is the first video in the course
   */
  const isFirstVideo = () => {
    if (!courseSectionData?.length) return true;
    
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );
    
    if (currentSectionIndx === -1) return true;

    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex(
      (data) => data._id === subSectionId
    );

    return currentSectionIndx === 0 && currentSubSectionIndx === 0;
  }

  /**
   * Navigate to the next video in the course sequence
   * Handles navigation within sections and between sections
   */
  const goToNextVideo = () => {

    // Find current section index
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    // Get total number of subsections in current section
    const noOfSubsections =
      courseSectionData[currentSectionIndx].subSection.length

    // Find current subsection index
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    // console.log("no of subsections", noOfSubsections)

    // Check if there are more videos in the current section
    if (currentSubSectionIndx !== noOfSubsections - 1) {
      // Navigate to next video in same section
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      )
    } else {
      // Navigate to first video of next section
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      )
    }
  }

  /**
   * Check if current video is the last video of the entire course
   * Used to conditionally show/hide next button
   * 
   * @returns {boolean} True if this is the last video in the course
   */
  const isLastVideo = () => {
    if (!courseSectionData?.length) return true;
    
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    );
    
    if (currentSectionIndx === -1) return true;

    const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection?.length || 0;
    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex(
      (data) => data._id === subSectionId
    );

    return (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    );
  }

  /**
   * Navigate to the previous video in the course sequence
   * Handles navigation within sections and between sections
   */
  const goToPrevVideo = () => {
    // console.log(courseSectionData)

    // Find current section index
    const currentSectionIndx = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )

    // Find current subsection index
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    // Check if there are previous videos in the current section
    if (currentSubSectionIndx !== 0) {
      // Navigate to previous video in same section
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      // Navigate to last video of previous section
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  /**
   * Handle marking a lecture as complete
   * Makes API call to update completion status and updates Redux store
   */
  const handleLectureCompletion = async () => {
    setLoading(true)
    
    // Make API call to mark lecture as complete
    const res = await markLectureAsComplete(
      { courseId: courseId, subSectionId: subSectionId }, // Changed from subsectionId to subSectionId
      token
    )
    
    // Update Redux store if API call successful
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
    }
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-5 text-white">
      {/* Video Player Section */}
      {!videoData ? (
        // Show course thumbnail when no video data is available
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        // Main video player with controls and overlay
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          onEnded={() => setVideoEnded(true)} // Trigger overlay when video ends
          src={videoData?.videoUrl}
        >
          {/* Large play button in center of video */}
          <BigPlayButton position="center" />
          
          {/* Video End Overlay - Shows completion and navigation options */}
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)", // Gradient overlay for readability
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {/* Mark as Complete button - only show if lecture not already completed */}
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              
              {/* Rewatch button - allows user to restart current video with autoplay */}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  if (playerRef?.current) {
                    // Reset video to beginning, hide overlay, and start autoplay
                    playerRef?.current?.seek(0)
                    setVideoEnded(false)
                    // Start playing the video automatically after seeking
                    setTimeout(() => {
                      playerRef?.current?.play()
                    }, 100) // Small delay to ensure seek completes
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />
              
              {/* Navigation buttons - Previous and Next video */}
              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {/* Previous button - only show if not the first video */}
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                
                {/* Next button - only show if not the last video */}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      {/* Video Information Section */}
      {/* Video title */}
      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      
      {/* Video description */}
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  )
}

export default VideoDetails
// video