import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@ramonak/react-progress-bar";

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

// Function to format duration - show actual duration from database
const getFormattedDuration = (course) => {
  // Calculate actual duration from courseContent
  if (course?.courseContent && course.courseContent.length > 0) {
    let totalDurationInSeconds = 0;
    
    course.courseContent.forEach((content) => {
      if (content.subSection && content.subSection.length > 0) {
        content.subSection.forEach((subSection) => {
          const parsed = parseInt(subSection.timeDuration);
          if (!isNaN(parsed) && parsed > 0) {
            totalDurationInSeconds += parsed;
          }
        });
      }
    });
    
    // Convert seconds to readable format
    const hours = Math.floor(totalDurationInSeconds / 3600);
    const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
    const seconds = Math.floor((totalDurationInSeconds % 3600) % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else if (seconds > 0) {
      return `${seconds}s`;
    } else {
      // If total is 0, show that instead of fake duration
      return "0s";
    }
  }
  
  // Fallback if no content
  return "Duration not available";
};

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserEnrolledCourses(token);
        console.log("Enrolled courses response:", res); // Debug log
        const filterPublishCourse = res?.filter((ele) => ele.status !== "Draft") || [];

        setEnrolledCourses(filterPublishCourse);
      } catch (err) {
        console.log("Error fetching enrolled courses:", err);
        setEnrolledCourses([]); // Set empty array on error
      }
    })();
  }, [token]);

  return (
    <>
      <div className="text-3xl text-richblack-5">Enrolled Courses</div>
      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
          {/* TODO: Modify this Empty State */}
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500 ">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>
          {/* Course Names */}
          {enrolledCourses.map((course, i, arr) => (
            <div
              className={`flex items-center border border-richblack-700 ${
                i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
              }`}
              key={course?._id || i}
            >
              <div
                className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() => {
                  console.log("Clicked course:", course); // Debug log
                  
                  if (!course?._id) {
                    console.error("Course ID is missing:", course);
                    return;
                  }
                  
                  const firstSection = course?.courseContent?.[0];
                  const firstSubSection = firstSection?.subSection?.[0];
                  
                  console.log("Navigation data:", {
                    courseId: course._id,
                    firstSection: firstSection?._id,
                    firstSubSection: firstSubSection?._id
                  });
                  
                  if (!firstSection?._id || !firstSubSection?._id) {
                    console.error("Course structure is incomplete, navigating to basic course view");
                    navigate(`/view-course/${course._id}`);
                    return;
                  }
                  
                  navigate(
                    `/view-course/${course._id}/section/${firstSection._id}/sub-section/${firstSubSection._id}`
                  );
                }}
              >
                <img
                  src={course?.thumbnail || "/default-course-image.jpg"}
                  alt="course_img"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course?.courseName || "Untitled Course"}</p>
                  <p className="text-xs text-richblack-300">
                    {course?.courseDescription && course.courseDescription.length > 50
                      ? `${course.courseDescription.slice(0, 50)}...`
                      : course?.courseDescription || "No description available"}
                  </p>
                </div>
              </div>
              <div className="w-1/4 px-2 py-3">
                {getFormattedDuration(course)}
              </div>
              <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                <p>Progress: {course?.progressPercentage || 0}%</p>
                <ProgressBar
                  completed={course?.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
