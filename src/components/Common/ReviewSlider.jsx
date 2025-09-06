import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "../../App.css"

// Icons
import { FaStar } from "react-icons/fa"

// Import required modules
import { Autoplay, FreeMode, Pagination } from "swiper/modules"

// Get apiFunction and the endpoint
import { apiConnector } from "../../services/apiConnector"
import { ratingsEndpoints } from "../../services/apis"

/**
 * ReviewSlider Component
 * 
 * A React component that displays course reviews in a sliding carousel format.
 * Fetches review data from an API and displays them with user information,
 * ratings, and truncated review text.
 */
function ReviewSlider() {
  // State to store the reviews data fetched from API
  const [reviews, setReviews] = useState([])
  
  // Number of words to show before truncating the review text
  const truncateWords = 15

  // Effect hook to fetch reviews data when component mounts
  useEffect(() => {
    // IIFE (Immediately Invoked Function Expression) to handle async API call
    ;(async () => {
      // Make API call to fetch reviews data
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      )
      
      // Check if API call was successful and update state
      if (data?.success) {
        setReviews(data?.data)
      }
    })()
  }, []) // Empty dependency array means this effect runs only once on mount

  // Debug log (commented out)
  // console.log(reviews)

  return (
    <div className="text-white">
      {/* Container div with responsive max-width */}
      <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent">
        {/* Swiper carousel component */}
        <Swiper
          slidesPerView={4} // Number of slides visible at once
          spaceBetween={25} // Space between slides in pixels
          loop={true} // Enable infinite loop
          freeMode={true} // Enable free mode for smooth sliding
          autoplay={{
            delay: 1100, // Auto-slide delay in milliseconds
            disableOnInteraction: false, // Continue autoplay after user interaction
          }}
          modules={[FreeMode, Pagination, Autoplay]} // Swiper modules to use
          className="w-full "
        >
          {/* Map through reviews array to create slides */}
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={i}>
                {/* Individual review card */}
                <div className="flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25">
                  
                  {/* User information section */}
                  <div className="flex items-center gap-4">
                    {/* User avatar - either from user image or generated initials */}
                    <img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    
                    {/* User name and course information */}
                    <div className="flex flex-col">
                      {/* User's full name */}
                      <h1 className="font-semibold text-richblack-5">
                        {`${review?.user?.firstName} ${review?.user?.lastName}`}
                      </h1>
                      {/* Course name */}
                      <h2 className="text-[12px] font-medium text-richblack-500">
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>
                  
                  {/* Review text with truncation logic */}
                  <p className="font-medium text-richblack-25">
                    {/* Check if review text exceeds truncateWords limit */}
                    {review?.review.split(" ").length > truncateWords
                      ? `${review?.review
                          .split(" ") // Split review into words array
                          .slice(0, truncateWords) // Take only first 'truncateWords' number of words
                          .join(" ")} ...` // Join back to string and add ellipsis
                      : `${review?.review}`} {/* Show full review if under limit */}
                  </p>
                  
                  {/* Rating section */}
                  <div className="flex items-center gap-2 ">
                    {/* Numerical rating display */}
                    <h3 className="font-semibold text-yellow-100">
                      {review.rating.toFixed(1)} {/* Show rating with 1 decimal place */}
                    </h3>
                    
                    {/* Star rating component */}
                    <ReactStars
                      count={5} // Total number of stars
                      value={review.rating} // Current rating value
                      size={20} // Size of stars in pixels
                      edit={false} // Disable editing (read-only)
                      activeColor="#ffd700" // Color for filled stars (gold)
                      emptyIcon={<FaStar />} // Icon for empty stars
                      fullIcon={<FaStar />} // Icon for filled stars
                    />
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
          {/* Commented out example slide */}
          {/* <SwiperSlide>Slide 1</SwiperSlide> */}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider