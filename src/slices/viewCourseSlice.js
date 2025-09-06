import { createSlice } from "@reduxjs/toolkit"

// Initial state for the view course functionality
// Manages course data, sections, and lecture completion tracking
const initialState = {
  courseSectionData: [],    // Array to store individual course sections/modules
  courseEntireData: [],     // Complete course data including all details
  completedLectures: [],    // Array of lecture IDs that user has completed
  totalNoOfLectures: 0,     // Total count of lectures in the course
}

// Redux slice for managing course viewing state
const viewCourseSlice = createSlice({
  name: "viewCourse",
  initialState,
  reducers: {
    // Set the course section data (modules/chapters)
    setCourseSectionData: (state, action) => {
      state.courseSectionData = action.payload
    },
    
    // Set the complete course data with all information
    setEntireCourseData: (state, action) => {
      state.courseEntireData = action.payload
    },
    
    // Set the total number of lectures in the course
    setTotalNoOfLectures: (state, action) => {
      state.totalNoOfLectures = action.payload
    },
    
    // Set the array of completed lecture IDs (overwrites existing)
    setCompletedLectures: (state, action) => {
      state.completedLectures = action.payload
    },
    
    // Add a new completed lecture to the existing array
    // Uses spread operator to maintain immutability
    updateCompletedLectures: (state, action) => {
      state.completedLectures = [...state.completedLectures, action.payload]
    },
  },
})

// Export action creators for use in components
export const {
  setCourseSectionData,      // Action to set course sections
  setEntireCourseData,       // Action to set complete course data
  setTotalNoOfLectures,      // Action to set total lecture count
  setCompletedLectures,      // Action to set completed lectures array
  updateCompletedLectures,   // Action to add new completed lecture
} = viewCourseSlice.actions

// Export the reducer to be used in store configuration
export default viewCourseSlice.reducer