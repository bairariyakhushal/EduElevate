import React from "react";
import { HomePageExplore } from "../../../data/homepage-explore";
import HighlightText from "./HighlightText";
import CourseCard from "./CourseCard";
import { useState } from "react";

const tabName = [
  "Free",
  "New to coding",
  "Most popular",
  "Skill paths",
  "Career paths",
];

const ExploreMore = () => {
  const [currentTab, setCurrentTab] = useState(tabName[0]);
  const [courses, setCourses] = useState(HomePageExplore[0].courses);
  const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0]);

  const setMyCards = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.find((course) => course.tag === value);
    setCourses(result.courses);
    setCurrentCard(result.courses[0]); // Set to first course object of new tab
  };

  return (
    <div>
      <div className="text-4xl font-semibold text-center my-10">
        Unlock the
        <HighlightText text={"Power of Code"} />
        <p className="text-center text-richblack-300 text-lg font-semibold mt-1">
          Learn to build anything you can imagine
        </p>
      </div>

      {/* Tabs Section */}
      <div
        className="hidden lg:flex gap-5 -mt-5 mx-auto w-max bg-richblack-800
       text-richblack-200 p-1 rounded-full font-medium
        drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]"
      >
        {tabName.map((element, index) => {
          return (
            <div
              className={` text-[16px] flex flex-row items-center gap-2 ${
                currentTab === element
                  ? "bg-richblack-900 text-richblack-5 font-medium"
                  : "text-richblack-200"
              } px-7 py-[7px] rounded-full transition-all duration-200 
              cursor-pointer hover:bg-richblack-900 hover:text-richblack-5`}
              key={index}
              onClick={() => setMyCards(element)}
            >
              {element}
            </div>
          );
        })}
      </div>

      <div className="lg:h-[200px]"></div>

      {/* Cards Group */}
      <div
        className="lg:absolute gap-10 justify-center lg:gap-0 flex lg:justify-between
      flex-wrap w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%]
      lg:translate-y-[50%] text-black lg:mb-0 mb-7 lg:px-0 px-3 "
      >
        {courses.map((element, index) => {
          return (
            <CourseCard
              key={index}
              cardData={element}
              currentCard={currentCard}
              setCurrentCard={setCurrentCard}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ExploreMore;
