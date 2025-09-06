import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Import API functions for fetching instructor data
import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI";
import { getInstructorData } from "../../../services/operations/profileAPI";
import InstructorChart from "./InstructorDashboard/InstructorChart";

export default function Instructor() {
  // Get authentication token and user data from Redux store
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  // Local state management
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [instructorData, setInstructorData] = useState(null); // Store instructor statistics data
  const [courses, setCourses] = useState([]); // Store list of instructor's courses

  // Effect hook to fetch data when component mounts
  useEffect(() => {
    // Use IIFE (Immediately Invoked Function Expression) to handle async operations
    (async () => {
      setLoading(true); //Start Loading

      //Fetch Instructor data and courses in parallel
      const instructorApiData = await getInstructorData(token);
      const result = await fetchInstructorCourses(token);

      console.log("Instructor Api Data.....", instructorApiData); //Debug log

      // Update state with fetched data if available
      if (instructorApiData?.length) {
        setInstructorData(instructorApiData);
      }
      if (result) {
        setCourses(result);
      }

      setLoading(false); //End Loading
    })();
  }, [token]); // Empty dependency array means this runs once on mount

  // Calculate total amount generated across all courses
  const totalAmount = instructorData?.reduce(
    (acc, curr) => acc +( curr.totalAmountGenerated || 0),
    0
  );

  // Calculate total students enrolled across all courses

  const totalStudents = instructorData?.reduce(
    (acc, curr) => acc + (curr.totalStudentsEnrolled || 0),
    0
  );

  return (
    <div>
      {/* Header section with greeting */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-richblack-5">
          Hi {user?.firstName} 👋 
        </h1>
        <p className="font-medium text-richblack-200">
          Let's start something new
        </p>
      </div>

      {/* Conditional rendering based on loading state and data availability */}
      {loading ? (
        // Show loading spinner while data is being fetched
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div> {/* Make sure spinner CSS exists */}
        </div>
      ) : courses.length > 0 ? (
        // Show dashboard content if courses exist
        <div>
          {/* Main dashboard content area */}
          <div className="my-4 flex h-[450px] space-x-4">
            {/* Chart/Visualization section */}
            {instructorData && instructorData.length > 0 ? (
              // Render chart if instructor data exists
              <InstructorChart courses={instructorData} />
            ) : (
              // Show message if no data available for visualization
              <div className="flex-1 rounded-md bg-richblack-800 p-6">
                <p className="text-lg font-bold text-richblack-5">Visualize</p>
                <p className="mt-4 text-xl font-medium text-richblack-50">
                  Not Enough Data To Visualize
                </p>
              </div>
            )}

            {/* Statistics sidebar */}
            <div className="flex min-w-[250px] flex-col rounded-md bg-richblack-800 p-6">
              <p className="text-lg font-bold text-richblack-5">Statistics</p>
              <div className="mt-4 space-y-4">
                {/* Total courses count */}
                <div>
                  <p className="text-lg text-richblack-200">Total Courses</p>
                  <p className="text-3xl font-semibold text-richblack-50">
                    {courses.length}
                  </p>
                </div>
                {/* Total students enrolled */}
                <div>
                  <p className="text-lg text-richblack-200">Total Students</p>
                  <p className="text-3xl font-semibold text-richblack-50">
                    {totalStudents}
                  </p>
                </div>
                {/* Total income generated */}
                <div>
                  <p className="text-lg text-richblack-200">Total Income</p>
                  <p className="text-3xl font-semibold text-richblack-50">
                    Rs. {totalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses preview section */}
          <div className="rounded-md bg-richblack-800 p-6">
            {/* Section header with view all link */}
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-richblack-5">Your Courses</p>
              <Link to="/dashboard/my-courses">
                <p className="text-xs font-semibold text-yellow-50">View All</p>
              </Link>
            </div>

            {/* Display first 3 courses in a grid */}
            <div className="my-4 flex items-start space-x-6">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} className="w-1/3">
                  {/* Course thumbnail image */}
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="h-[201px] w-full rounded-md object-cover"
                  />
                  {/* Course details */}
                  <div className="mt-3 w-full">
                    {/* Course name */}
                    <p className="text-sm font-medium text-richblack-50">
                      {course.courseName}
                    </p>
                    {/* Course statistics: students enrolled and price */}
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-xs font-medium text-richblack-300">
                        {course.studentsEnrolled.length} students
                      </p>
                      <p className="text-xs font-medium text-richblack-300">
                        |
                      </p>
                      <p className="text-xs font-medium text-richblack-300">
                        Rs. {course.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Show empty state when no courses exist
        <div className="mt-20 rounded-md bg-richblack-800 p-6 py-20">
          <p className="text-center text-2xl font-bold text-richblack-5">
            You have not created any courses yet
          </p>
          {/* Call-to-action link to create first course */}
          <Link to="/dashboard/add-course">
            <p className="mt-1 text-center text-lg font-semibold text-yellow-50">
              Create a course
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}
