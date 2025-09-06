import { toast } from "react-hot-toast";

import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { resetCart } from "../../slices/cartSlice"
import { setPaymentLoading } from "../../slices/courseSlice"
import { apiConnector } from "../apiConnector"
import { studentEndpoints } from "../apis"

const {
    COURSE_PAYMENT_API,
    COURSE_VERIFY_API,
    SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints

// Load the Razorpay SDK from the CDN
function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script")
        script.src = src
        script.onload = () => {
            resolve(true)
        }
        script.onerror = () => {
            resolve(false)
        }
        document.body.appendChild(script)
    })
}

// Buy the Course
export async function BuyCourse(
    token,
    courses,
    user_details,
    navigate,
    dispatch
) {
    const toastId = toast.loading("Loading...")

    try {
        // Loading the script of Razorpay SDK
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

        if (!res) {
            toast.error(
                "Razorpay SDK failed to load. Check your Internet Connection."
            )
            return
        }

        // Initiating the Order in Backend
        const orderResponse = await apiConnector(
            "POST",
            COURSE_PAYMENT_API,
            {
                courses,
            },
            {
                Authorization: `Bearer ${token}`,
            }
        )

        if (!orderResponse.data.success) {
            throw new Error(orderResponse.data.message)
        }
        
        console.log("PAYMENT RESPONSE FROM BACKEND.....", orderResponse.data)

        // Opening the Razorpay SDK
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            currency: orderResponse.data.data.currency,
            amount: `${orderResponse.data.data.amount}`,
            order_id: orderResponse.data.data.id,
            name: "EduElevate",
            description: "Thank you for Purchasing the Course.",
            image: rzpLogo,
            prefill: {
                name: `${user_details.firstName} ${user_details.lastName}`,
                email: user_details.email,
            },
            handler: function (response) {
                sendPaymentSuccessEmail(response, orderResponse.data.data.amount, token)
                verifyPayment({ ...response, courses }, token, navigate, dispatch)
            },
            theme: {
                color: "#686CFD"
            },
            config: {
                display: {
                    hide: [
                        { method: "paylater" },
                        { method: "emi" }
                    ]
                }
            }
        }

        const paymentObject = new window.Razorpay(options)

        paymentObject.open()
        paymentObject.on("payment.failed", function (response) {
            toast.error("Oops! Payment Failed.")
            console.log(response.error)
        })
    } catch (error) {
        console.log("BUY COURSE ERROR", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
}

// Verify the Payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Paynment...")
    dispatch(setPaymentLoading(true))

    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        })

        console.log("VERIFY PAYMENT RESPONSE FROM BACKEND............", response)

        if (!response.data.success) {
            throw new Error(response.data.message)
        }

        toast.success("Payment Verified Successfully")
        dispatch(resetCart())
        navigate("/dashboard/enrolled-courses")
    } catch (error) {
        console.log("VERIFY PAYMNENT ERROR.....",error)
        toast.error(error.message)
    }

    toast.dismiss(toastId)
    dispatch(setPaymentLoading(false))
}

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error)
  }
}