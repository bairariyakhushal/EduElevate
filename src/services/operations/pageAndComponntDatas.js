import { toast } from "react-hot-toast"


import { apiConnector } from "../apiConnector"
import { catalogData } from "../apis"

export const getCatalogPageData = async (categoryId) => {
  const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiConnector(
      "POST",
      catalogData.CATALOGPAGEDATA_API,
      {
        categoryId: categoryId,
      }
    )
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Catagory page data.")
    }
    result = response?.data
    console.log("CATALOGPAGEDATA_API API RESPONSE............", response)
  } catch (error) {
    console.log("CATALOGPAGEDATA_API API ERROR............", error)
    result = error.response?.data
  }
  toast.dismiss(toastId)
  return result
}
