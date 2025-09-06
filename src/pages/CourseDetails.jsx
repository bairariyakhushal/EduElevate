import React, { useEffect, useState } from "react";
import { BiInfoCircle } from "react-icons/bi";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

// Component imports
import ConfirmationModal from "../components/Common/ConfirmationModal";
import Footer from "../components/Common/Footer";
import RatingStars from "../components/Common/RatingStars";
import CourseAccordionBar from "../components/core/Course/CourseAccordionBar";
import CourseDetailsCard from "../components/core/Course/CourseDetailsCard";

// Service and utility imports
import { formattedDate } from "../utils/dateFormatter";
import { fetchCourseDetails } from "../services/operations/courseDetailsAPI";
import { BuyCourse } from "../services/operations/studentFeaturesAPI";
import GetAvgRating from "../utils/avgRating";
import Error from "./Error";
import { addToCart } from "../slices/cartSlice";
import { ACCOUNT_TYPE } from "../utils/constants";
import { toast } from "react-hot-toast";

function CourseDetails() {
  // Redux state selectors
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.profile);
  const { paymentLoading } = useSelector((state) => state.course);

  // Redux dispatch and navigation hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Getting courseId from URL parameter
  const { courseId } = useParams();

  // Component state variables
  const [response, setResponse] = useState(null); // Store course details response
  const [confirmationModal, setConfirmationModal] = useState(null); // Modal state for confirmations
  const [avgReviewCount, setAvgReviewCount] = useState(0); // Average rating of the course
  const [isActive, setIsActive] = useState(Array(0)); // Track which accordion sections are expanded
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0); // Total lectures count

  // Fetch course details when component mounts or courseId changes
  useEffect(() => {
    // Calling fetchCourseDetails function to fetch the details
    (async () => {
      try {
        const res = await fetchCourseDetails(courseId);
        // console.log("course details res: ", res)
        setResponse(res);
        console.log("course details res: ", res);
      } catch (error) {
        console.log("Could not fetch Course Details");
      }
    })();
  }, [courseId]);

  // Calculate average review rating when course data changes
  useEffect(() => {
    const count = GetAvgRating(response?.data?.ratingAndReview);
    setAvgReviewCount(count);
  }, [response]);

  // Handle accordion section expand/collapse functionality
  const handleActive = (id) => {
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id]) // Add section to active list
        : isActive.filter((e) => e !== id) // Remove section from active list
    );
  };

  // Calculate total number of lectures across all sections
  useEffect(() => {
    let lectures = 0;
    response?.data?.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0;
    });
    setTotalNoOfLectures(lectures);
  }, [response]);

  // Show loading spinner while data is being fetched
  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show error page if API call failed
  if (!response.success) {
    return <Error />;
  }

  // Destructure course details from response
  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReview: ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
    courseDuration
  } = response.data;
  
  console.log("Course ID :", course_id);
  
  // Handle adding course to cart
  const handleAddToCart = () => {
    // Prevent instructors from buying courses
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.");
      return;
    }

    // If user is logged in, add to cart
    if (token) {
      dispatch(addToCart(response.data));
      return;
    }

    // If not logged in, show login confirmation modal
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };
  
  // Handle course purchase logic
  const handleBuyCourse = () => {
    // If user is logged in, proceed with purchase
    if (token) {
      BuyCourse(token, [courseId], user, navigate, dispatch);
      return;
    }
    // If not logged in, show login confirmation modal
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  // Show loading spinner during payment processing
  if (paymentLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* Main course details container */}
      <div className={`relative w-full bg-richblack-800`}>
        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative ">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            {/* Course thumbnail - visible only on mobile */}
            <div className="relative block max-h-[30rem] lg:hidden">
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full"
              />
            </div>

            {/* Course information section */}
            <div
              className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}
            >
              {/* Course title */}
              <div>
                <p className="text-4xl font-bold text-richblack-5 sm:text-[42px]">
                  {courseName}
                </p>
              </div>

              {/* Course description */}
              <p className={`text-richblack-200`}>{courseDescription}</p>

              {/* Rating, reviews, and enrollment info */}
              <div className="text-md flex flex-wrap items-center gap-2">
                <span className="text-yellow-25">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                <span>{`(${ratingAndReviews?.length || 0} reviews)`}</span>
                <span>{`${
                  studentsEnrolled?.length || 0
                } students enrolled`}</span>
              </div>

              {/* Instructor information */}
              <div>
                <p className="">
                  Created By {`${instructor.firstName} ${instructor.lastName}`}
                </p>
              </div>

              {/* Course metadata (creation date and language) */}
              <div className="flex flex-wrap gap-5 text-lg">
                <p className="flex items-center gap-2">
                  {" "}
                  <BiInfoCircle /> Created at {formattedDate(createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  {" "}
                  <HiOutlineGlobeAlt /> English
                </p>
              </div>
            </div>

            {/* Mobile-only price and purchase buttons */}
            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
              <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-5">
                Rs. {price}
              </p>
              
              {/* Add to Cart button - only show if user is not enrolled */}
              {(!user || !studentsEnrolled?.includes(user?._id)) && (
                <button className="blackButton" onClick={handleAddToCart}>Add to Cart</button>
              )}
              
              <button 
                className="yellowButton" 
                onClick={
                  user && studentsEnrolled?.includes(user?._id)
                    ? () => {
                        const firstSection = courseContent?.[0];
                        const firstSubSection = firstSection?.subSection?.[0];
                        
                        if (!firstSection?._id || !firstSubSection?._id) {
                          console.error("Course structure is incomplete, navigating to basic course view");
                          navigate(`/view-course/${courseId}`);
                          return;
                        }
                        
                        navigate(`/view-course/${courseId}/section/${firstSection._id}/sub-section/${firstSubSection._id}`);
                      }
                    : handleBuyCourse
                }
              >
                {user && studentsEnrolled?.includes(user?._id) ? "Go To Course" : "Buy Now"}
              </button>
            </div>
          </div>

          {/* Desktop course details card - positioned absolutely on larger screens */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute lg:block">
            <CourseDetailsCard
              course={response?.data}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>

      {/* Course content and details section */}
      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* What you'll learn section */}
          <div className="my-8 border border-richblack-600 p-8">
            <p className="text-3xl font-semibold">What you'll learn</p>
            <div className="mt-5 gap-10 text-richblack-50">
              {/* Render markdown content for learning outcomes */}
              <ReactMarkdown>{whatYouWillLearn}</ReactMarkdown>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px] ">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold">Course Content</p>

              {/* Course statistics and collapse button */}
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>
                    {`${courseContent?.length || 0} 
                    ${courseContent?.length === 1 ? "section" : "sections"}
                    `} 
                  </span>
                  <span>
                    {`${totalNoOfLectures}
                    ${totalNoOfLectures === 1 ? "lecture" : "lectures"}
                    `}
                  </span>
                  <span>{courseDuration} Total Duration</span>
                </div>
                <div>
                  {/* Button to collapse all accordion sections */}
                  <button
                    className="text-yellow-25"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all sections
                  </button>
                </div>
              </div>
            </div>

            {/* Course content accordion - render each section */}
            <div className="py-4">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Instructor/Author Details Section */}
            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold">Author</p>

              {/* Instructor profile info */}
              <div className="flex items-center gap-4 py-4">
                <img
                  src={
                    instructor.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}` // Fallback avatar
                  }
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="text-lg">{`${instructor.firstName} ${instructor.lastName}`}</p>
              </div>

              {/* Instructor bio/about section */}
              <p className="text-richblack-50">
                {instructor?.additionalDetails?.about}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer component */}
      <Footer />

      {/* Conditional confirmation modal rendering */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}

export default CourseDetails;
