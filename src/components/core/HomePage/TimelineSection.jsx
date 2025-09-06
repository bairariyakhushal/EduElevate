import React from "react";

import Logo1 from "../../../assets/TimeLineLogo/Logo1.svg";
import Logo2 from "../../../assets/TimeLineLogo/Logo2.svg";
import Logo3 from "../../../assets/TimeLineLogo/Logo3.svg";
import Logo4 from "../../../assets/TimeLineLogo/Logo4.svg";
import timelineImage from "../../../assets/Images/TimelineImage.png";

const timeline = [
  {
    Logo: Logo1,
    heading: "Leadership",
    Description: "Fully committed to the success company",
  },
  {
    Logo: Logo2,
    heading: "Responsibility",
    Description: "Students will always be our top priority",
  },
  {
    Logo: Logo3,
    heading: "Flexibility",
    Description: "The ability to switch is an important skills",
  },
  {
    Logo: Logo4,
    heading: "Solve the problem",
    Description: "Code your way to a solution",
  },
];

const TimelineSection = () => {
  return (
    <div className="flex flex-row gap-20 items-center">
      <div className="w-[45%] flex flex-col gap-3">
        {timeline.map((element, index) => {
          return (
            <div className="flex flex-col lg:gap-3" key={index}>
              <div className="flex flex-row gap-6" key={index}>
                <div className="w-[52px] h-[52px] bg-white flex items-center justify-center rounded-full shadow-[0_0_62px_0] shadow-[#00000012]">
                  <img src={element.Logo} />
                </div>

                <div>
                  <h2 className="font-semibold text-[18px]">
                    {element.heading}
                  </h2>
                  <p className="text-base">{element.Description}</p>
                </div>
              </div>

              <div
                className={`hidden ${
                  timeline.length - 1 === index ? "hidden" : "lg:block"
                }  h-14 w-[26px] border-r border-dotted border-richblack-100 bg-richblack-400/0`}
              ></div>
            </div>
          );
        })}
      </div>

      <div className="relative bottom-0 h-fit w-fit shadow-[0px_0px_30px_0px] shadow-blue-200">
        <img
          src={timelineImage}
          alt="timelineImage"
          className="shadow-[20px_20px_0px_0px] shadow-white lg:h-fit object-cover "
        />
        
        <div
          className="absolute bg-caribbeangreen-700 flex flex-row text-white uppercase py-7
                        left-[50%] translate-x-[-50%] translate-y-[-50%]"
        >
          <div className="flex flex-row gap-5 items-center border-r  border-caribbeangreen-300 px-14">
            <h1 className="w-[75px] text-3xl font-bold">10</h1>
            <h1 className="w-[75px] text-caribbeangreen-300 text-sm">
              Years of Experience
            </h1>
          </div>

          <div className="flex flex-row gap-5 items-center px-7">
            <h1 className="w-[75px] text-3xl font-bold">250</h1>
            <h1 className="w-[75px] text-caribbeangreen-300 text-sm">Types of Courses</h1>
          </div>
          <div></div>
        </div>

        
      </div>
    </div>
    
  );
};

export default TimelineSection;
