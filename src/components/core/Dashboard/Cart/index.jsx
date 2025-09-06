import { useSelector } from "react-redux";

import RenderCartCourses from "./RenderCartCourses";
import RenderTotalAmount from "./RenderTotalAmount";

export default function Cart() {
  const { total, totalItems } = useSelector((state) => state.cart);

  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Shopping Cart</h1>
      <p className="border-b border-b-richblack-400 pb-2 font-semibold text-richblack-400">
        {totalItems} Courses in Cart
      </p>
      {total > 0 ? (
        <div className="mt-8 flex flex-col-reverse items-start gap-x-10 gap-y-6 lg:flex-row">
          <RenderCartCourses />
          <RenderTotalAmount />
        </div>
      ) : (
        <div className="mt-14 text-center">
          <p className="text-3xl text-richblack-100 mb-4">Your cart is empty</p>
          <p className="text-richblack-400">Add some courses to get started!</p>
        </div>
      )}
    </>
  );
}
