import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import CountryCode from "../../../data/countrycode.json";
import { apiConnector } from "../../../services/apiConnector";
import { contactusEndpoint } from "../../../services/apis";

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const submitContactForm = async (data) => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "POST",
        contactusEndpoint.CONTACT_US_API,
        data
      );
      setLoading(false);
    } catch (err) {
      console.log("Error Message", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phoneNo: "",
        message: "",
      });
    }
  }, [reset, isSubmitSuccessful]);

  return (
    <form
      className="flex- flex-col gap-7"
      onSubmit={handleSubmit(submitContactForm)}
    >
      {/* First & Last name */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* First Name */}
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="firstname" className="lable-style text-white">
            First Name
          </label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Enter first name"
            className="form-style w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
            {...register("firstname", { required: true })}
          />
          {errors.firstname && (
            <span className="-mt-1 text-[12px] text-yellow-100">
              Please enter your name.
            </span>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="lastname" className="lable-style text-white">
            Last Name
          </label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Enter last name"
            className="form-style w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
            style={{
              boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
            }}
            {...register("lastname")}
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2 mt-5">
        <label htmlFor="email" className="lable-style text-white">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter email address"
          className="form-style w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
          style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
          }}
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            Please enter your Email address.
          </span>
        )}
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-2 mt-5">
        <label htmlFor="phonenumber" className="lable-style text-white">
          Phone Number
        </label>

        {/* Country Code , Phone Number */}
        <div className="flex gap-5">
          {/* Country Code */}
          <div className="flex w-[81px] flex-col gap-2">
            <select
              type="text"
              className="form-style w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              {...register("countrycode", { required: true })}
            >
              {CountryCode.map((ele, i) => {
                return (
                  <option key={i} value={ele.code}>
                    {ele.code} - {ele.country}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Phone Number */}
          <div className="flex w-[calc(100%-90px)] flex-col gap-2">
            <input
              type="tel"
              name="phonenumber"
              id="phonenumber"
              placeholder="12345 67890"
              className="form-style w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
              style={{
                boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
              }}
              {...register("phoneNo", {
                required: {
                  value: true,
                  message: "Please enter your Phone Number.",
                },
                maxLength: { value: 12, message: "Invalid Phone Number" },
                minLength: { value: 10, message: "Invalid Phone Number" },
              })}
            />
          </div>
        </div>

        {errors.phoneNo && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            {errors.phoneNo.message}
          </span>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2 mt-4">
        <label htmlFor="message" className="lable-style text-white">
          Message
        </label>

        <textarea
          name="message"
          id="message"
          cols="30"
          rows="7"
          placeholder="Enter your message here"
          className="form-style w-full rounded-[0.5rem] bg-richblack-700 p-[12px] text-richblack-5"
          style={{
            boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
          }}
          {...register("message", { required: true })}
        />
        {errors.message && (
          <span className="-mt-1 text-[12px] text-yellow-100">
            Please enter your Message.
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        disabled={loading}
        type="submit"
        className={`mt-4 rounded-md bg-yellow-50 px-6 py-3 text-center text-[16px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
         ${
           !loading &&
           "transition-all duration-200 hover:scale-95 hover:shadow-none"
         } w-full`}
      >
        Send Message
      </button>
    </form>
  );
};

export default ContactUsForm;
