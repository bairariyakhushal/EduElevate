import { toast } from "react-hot-toast"

import { setUser } from '../../slices/profileSlice';
import { apiConnector } from '../apiConnector';
import { settingsEndpoints } from './../apis';
import { logout } from './authAPI'

const {
    UPDATE_DISPLAY_PICTURE_API,
    UPDATE_PROFILE_API,
    CHANGE_PASSWORD_API,
    DELETE_PROFILE_API,
} = settingsEndpoints

export function updateDisplayPicture(token, formData) {
    return async (dispatch) => {
        const toastId = toast.loading("Updating Profile Picture...")
        try {
            const response = await apiConnector(
                "PUT",
                UPDATE_DISPLAY_PICTURE_API,
                formData,
                {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            )

            console.log(
                "UPDATE_DISPLAY_PICTURE_API API RESPONSE............",
                response
            )

            if (!response.data.success) {
                throw new Error(response.data.message)
            }

            toast.success("Display Picture Updated Successfully")
            dispatch(setUser(response.data.data))
        } catch (error) {
            console.log("UPDATE_DISPLAY_PICTURE_API API ERROR............", error)
            toast.error("Failed to Update Display Picture")
        }
        toast.dismiss(toastId)
    }
}

export function updateProfile(token, formData) {
    return async (dispatch, getState) => {
        const toastId = toast.loading("Loading...")
        try {
            const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
                Authorization: `Bearer ${token}`,
            })
            console.log("UPDATE_PROFILE_API API RESPONSE............", response?.data)

            if (!response.data.success) {
                throw new Error(response.data.message)
            }

            const currentUser = getState()?.profile?.user || {}
            const details = response?.data?.profileDetails

            if (!details || typeof details !== 'object') {
                throw new Error("Invalid response: missing user data")
            }

            // Normalize backend keys to frontend shape
            const normalizedAdditionalDetails = {
                ...currentUser?.additionalDetails,
                ...details,
                dateOfBirth: details?.dateOfBirth || details?.DOB || currentUser?.additionalDetails?.dateOfBirth || "",
                contactNumber: details?.contactNumber || details?.contact || currentUser?.additionalDetails?.contactNumber || "",
                gender: details?.gender ?? currentUser?.additionalDetails?.gender ?? "",
                about: details?.about ?? currentUser?.additionalDetails?.about ?? "",
            }

            const firstName = currentUser?.firstName || "User"
            const lastName = currentUser?.lastName || ""
            const image = currentUser?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`

            dispatch(setUser({ ...currentUser, additionalDetails: normalizedAdditionalDetails, image }))
            toast.success("Profile Updated Successfully")
        } catch (error) {
            console.log("UPDATE_PROFILE_API API ERROR............", error)
            toast.error("Could Not Update Profile")
        }
        toast.dismiss(toastId)
    }
}

export async function changePassword(token, formData) {
    const toastId = toast.loading("Changing Password...")
    try {
        // Backend expects: oldPassword, newPassword, confirmNewPassword
        const payload = {
            oldPassword: formData?.oldPassword,
            newPassword: formData?.newPassword,
            confirmNewPassword: formData?.confirmNewPassword,
        }

        console.log("Sending password change payload:", payload)

        const response = await apiConnector(
            "POST",
            CHANGE_PASSWORD_API,
            payload,
            {
                Authorization: `Bearer ${token}`
            }
        )

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Password Changed Successfully")
    } catch (error) {
        const msg = error?.response?.data?.message || error?.message || "Failed to Change Password"
        console.error("CHANGE_PASSWORD_API API ERROR............", error)
        toast.error(msg)
    }

    toast.dismiss(toastId)
}

export function deleteProfile(token, navigate) {
    return async (dispatch) => {
        const toastId = toast.loading("Deleting Profile...")
        try {
            const response = await apiConnector(
                "DELETE",
                DELETE_PROFILE_API,
                null,
                {
                    Authorization: `Bearer ${token}`
                }
            )

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            toast.success("Account deleted successfully!")
            dispatch(logout(navigate))
        } catch (error) {
            console.error("DELETE_PROFILE_API API ERROR............", error)
            toast.error("Failed to Delete Profile")
        }

        toast.dismiss(toastId)
    }
}