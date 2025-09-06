import React from "react";

import Footer from "../components/Common/Footer";
import ContactDetails from "../components/core/ContactUsPage/ContactDetails";
import ContactForm from "../components/core/ContactUsPage/ContactForm";
import ReviewSlider from "../components/Common/ReviewSlider";

const Contact = () => {
  return (
    <div>
      {/* Contact Detail , Contact Form */}
      <div className="mx-auto mt-20 flex w-11/12 max-w-maxContent flex-col justify-between gap-10 text-white lg:flex-row">
        {/* Left Contact Detail */}
        <div className="lg:w-[40%]">
          <ContactDetails />
        </div>

        {/* Right Contact Form */}
        <div className="lg:w-[60%]">
          <ContactForm />
        </div>
      </div>

      {/* Review Slider */}
      <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
        <h1 className="text-center text-4xl font-semibold mt-8">
          Reviews from other learners
        </h1>
        <ReviewSlider />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
