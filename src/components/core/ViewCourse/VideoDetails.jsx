import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import ReactPlayer from 'react-player';
import { useLocation } from "react-router-dom"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import IconBtn from "../../Common/IconBtn"

/**
 * VideoDetails Component - Enhanced with better UI and download protection
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
  const [playing, setPlaying] = useState(false)          // Control video playback state
  const [played, setPlayed] = useState(0)               // Track video progress

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
        console.log("Video URL:", filteredVideoData?.[0]?.videoUrl);
        
        // Set the current video data and preview
        setVideoData(filteredVideoData?.[0]);
        setPreviewSource(courseEntireData?.thumbnail);
        setVideoEnded(false); // Reset video ended state when switching videos
        setPlaying(false);    // Reset playing state
        setPlayed(0);         // Reset progress
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
  // Line 172 mein ye change karo:
const handleLectureCompletion = async () => {
  setLoading(true)
  
  const res = await markLectureAsComplete(
    { courseId: courseId, subSectionId: subSectionId }, // ✅ Consistent naming
    token
  )
  
  if (res) {
    dispatch(updateCompletedLectures(subSectionId))
  }
  
  setLoading(false)
}

  return (
    <div className="flex flex-col gap-5 text-white">
      {/* Video Player Section - Enhanced UI */}
      {!videoData ? (
        // Show course thumbnail when no video data is available
        <div className="relative w-full bg-richblack-800 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={previewSource}
            alt="Course Preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg font-medium">Loading Video...</p>
            </div>
          </div>
        </div>
      ) : (
        // Main video player with enhanced styling and download protection
        <div className="relative w-full bg-richblack-800 rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
          {/* Custom Video Container with Enhanced Styling */}
          <div className="relative w-full h-full bg-black">
            <ReactPlayer
              ref={playerRef}
              url={videoData?.videoUrl}
              width="100%"
              height="100%"
              controls={true}
              playing={playing}
              onEnded={() => setVideoEnded(true)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onProgress={({ played }) => setPlayed(played)}
              onError={(e) => console.error("ReactPlayer error:", e)}
              onContextMenu={(e) => e.preventDefault()} // Disable right-click context menu
              config={{
                file: {
                  attributes: {
                    playsInline: true,
                    controlsList: 'nodownload noremoteplayback', // Remove download button and cast button
                    disablePictureInPicture: true, // Disable picture-in-picture
                    onContextMenu: (e) => e.preventDefault(), // Disable right-click
                    style: { 
                      width: '100%', 
                      height: '100%',
                      outline: 'none'
                    }
                  }
                }
              }}
              style={{
                borderRadius: '0px', // Remove border radius from player itself
                outline: 'none'
              }}
            />
            
            {/* Subtle gradient overlay for better readability */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
          </div>
          
          {/* Video End Overlay - Enhanced with better styling */}
          {videoEnded && (
            <div
              className="absolute inset-0 z-[100] bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center space-y-6 px-6">
                {/* Completion Icon */}
                <div className="w-20 h-20 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">Video Complete!</h3>
                
                {/* Action Buttons Container */}
                <div className="space-y-4">
                  {/* Mark as Complete button - Enhanced styling */}
                  {!completedLectures.includes(subSectionId) && (
                    <button
                      disabled={loading}
                      onClick={handleLectureCompletion}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Marking Complete...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Mark as Complete
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Rewatch button - Enhanced styling */}
                  <button
                    disabled={loading}
                    onClick={() => {
                      if (playerRef?.current) {
                        playerRef.current.seekTo(0)
                        setVideoEnded(false)
                        setPlaying(true)
                        setTimeout(() => {
                          setPlaying(true)
                        }, 100)
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto min-w-[200px]"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Rewatch
                  </button>
                </div>
                
                {/* Navigation buttons - Enhanced with better styling */}
                <div className="flex justify-center gap-4 pt-6">
                  {/* Previous button */}
                  {!isFirstVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToPrevVideo}
                      className="bg-richblack-700 hover:bg-richblack-600 disabled:bg-richblack-700/50 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Previous
                    </button>
                  )}
                  
                  {/* Next button */}
                  {!isLastVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToNextVideo}
                      className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-richblack-900 px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      Next
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Information Section - Enhanced styling */}
      <div className="bg-richblack-800 rounded-xl p-6 shadow-lg">
        {/* Video title with enhanced typography */}
        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
          {videoData?.title || "Loading..."}
        </h1>
        
        {/* Video description with better spacing */}
        <div className="prose prose-invert max-w-none">
          <p className="text-richblack-100 text-lg leading-relaxed">
            {videoData?.description || "Loading video description..."}
          </p>
        </div>
        
        {/* Video metadata (optional - can show duration, views, etc.) */}
        {videoData && (
          <div className="mt-6 pt-4 border-t border-richblack-600 flex items-center gap-6 text-sm text-richblack-300">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Duration: {videoData.timeDuration || "N/A"}</span>
            </div>
            {completedLectures.includes(subSectionId) && (
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Completed</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoDetails