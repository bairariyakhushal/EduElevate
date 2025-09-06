import React, { useEffect, useState } from "react";
// Naya correct import
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";

// CSS imports bhi add karna padega
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import Course_Card from "./Course_Card";

function Course_Slider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          freeMode={true} // Enable free mode for smooth sliding
          autoplay={{
            delay: 1100, // Auto-slide delay in milliseconds
            disableOnInteraction: false, // Continue autoplay after user interaction
          }}
          modules={[FreeMode, Pagination, Autoplay]} // Swiper modules to use
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
          }}
          className="max-h-[30rem]"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={i}>
              <Course_Card course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  );
}

export default Course_Slider;
