import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import HighlightText from "../components/core/HomePage/HighlightText";

import CTAButton from "../components/core/HomePage/Button";
import Banner from "../assets/Images/banner.mp4";
import CodeBlock from "../components/core/HomePage/CodeBlock";
import TimelineSection from "../components/core/HomePage/TimelineSection";
import LearningLanguageSection from "../components/core/HomePage/LearningLanguageSection";
import InstructorSection from "../components/core/HomePage/InstructorSection";
import Footer from "../components/Common/Footer";
import ExploreMore from "../components/core/HomePage/ExploreMore";
import ReviewSlider from "../components/Common/ReviewSlider";
const Home = () => {
  return (
    <div>
      {/*Section 1*/}
      <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center justify-between text-white gap-8">
        {/* Become a Instructor Button */}
        <Link to={"/signup"}>
          <div
            className="mt-16 p-1 mx-auto rounded-full bg-richblack-800 text-richblack-200
          transition-all duration-200  hover:scale-95 w-fit flex flex-row items-center gap-2 
          px-10 py-3 hover:bg-richblack-900 font-bold hover:ring-4 ring-richblack-800 shadow-[inset_0_-1px_0_rgba(255,255,255,0.2)]"
          >
            <p>Become an Instructor</p>
            <FaArrowRight />
          </div>
        </Link>

        {/* Heading */}
        <div className="text-center text-4xl font-semibold mt-1">
          Unlock Your Future with 
          <HighlightText text={" Intelligent Coding & AI Insights"} /> 
        </div>

        {/* Sub Heading */}
        <div className="mt-1 w-[90%] text-center text-lg font-bold text-richblack-300">
          Leverage our intelligent, AI-enhanced online coding platform to learn at your own pace, from anywhere globally. Access cutting-edge resources like hands-on projects, dynamic quizzes, automated code evaluation, and personalized AI-powered insights to supercharge your coding skills.
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-row gap-7 mt-3 mb-6">
          <CTAButton active={true} linkto={"/signup"}>
            Learn More
          </CTAButton>

          <CTAButton active={false} linkto={"/login"}>
            Book a Demo
          </CTAButton>
        </div>

        {/* Video */}
        <div className="mx-3 my=7 shadow-[10px_-5px_50px_-5px] shadow-blue-200">
          <video
            className="shadow-[20px_20px_rgba(255,255,255)]"
            muted
            loop
            autoPlay
          >
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        {/* Code Section 1 */}
        <div>
          <CodeBlock
            position={"lg:flex-row"}
            heading={
              <div className="text-4xl font-semibold">
                Unlock Your
                <HighlightText text={"Coding Potential "} />
                with Our Online Courses
              </div>
            }
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={{
              btnText: "Try it Yourself",
              linkto: "/signup",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              lonkto: "/login",
              active: false,
            }}
            codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            codeColor={"text-yellow-25"}
            backgroundGradient={<div className="codeblock1 absolute"></div>}
          />
        </div>

        {/* Code Section 2 */}
        <div>
          <CodeBlock
            position={"lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%">
                Start
                <HighlightText text={"Coding in Seconds"} />
              </div>
            }
            subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={{
              btnText: "Continue Lesson",
              active: true,
              linkto: "/signup",
            }}
            ctabtn2={{
              btnText: "Learn More",
              active: false,
              linkto: "/login",
            }}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            codeColor={"text-white"}
            backgroundGradient={<div className="codeblock2 absolute"></div>}
          />
        </div>

        <ExploreMore/>
      </div>

      {/*Section 2*/}
      <div className="bg-pure-greys-5 text-richblack-700">
        <div className="homepage_bg h-[320px]">
          <div className="w-11/12 max-w-maxContent flex flex-col items-center justify-center gap-8 mx-auto">
            <div className="lg:h-[150px]"></div>
            <div className="flex flex-row gap-7 text-white lg:mt-8">
              <CTAButton active={true} linkto={"/signup"}>
                <div className="flex items-center gap-3">
                  Explore Full Catalog
                  <FaArrowRight />
                </div>
              </CTAButton>

              <CTAButton active={false} linkto={"/login"}>
                <div>Learn More</div>
              </CTAButton>
            </div>
          </div>
        </div>

        <div className="mx-auto w-11/12 max-w-maxContent flex flex-col items-center justify-between gap-7">
          <div className="flex flex-row gap-48 mb-10 mt-[100px]">
            <div className="text-4xl font-semibold w-[45%]">
              Get the Skills you need for a{" "}
              <HighlightText text={"Job that is in demand."} />
            </div>

            <div className="flex flex-col gap-10 w-[37%] items-start">
              <div className="text-[16px]">
                The modern EduElevate is the dictates its own terms. Today, to
                be a competitive specialist requires more than professional
                skills.
              </div>

              <CTAButton active={true} linkto={"/signup"}>
                <div>Learn More</div>
              </CTAButton>
            </div>
          </div>

          <TimelineSection />

          <LearningLanguageSection />
        </div>
      </div>

      {/*Section 3*/}
      <div
        className="w-11/12 mx-auto max-w-maxContent flex-col
      items-center justify-between gap-8 bg-richblack-900 text-whilte"
      >
        <InstructorSection />

        <h2 className="text-center text-4xl font-semibold mt-10 text-white">
            Review from other Learners
        </h2>
        {/* Review Slider */}
            <ReviewSlider />
      </div>

      {/* Footer */}
      <Footer></Footer>
    </div>
  );
};

export default Home;
