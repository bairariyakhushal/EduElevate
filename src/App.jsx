import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import Navbar from "./components/Common/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { setUser } from "./slices/profileSlice";
import { apiConnector } from "./services/apiConnector";
import { profileEndpoints } from "./services/apis";

import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Settings from "./components/core/Dashboard/Settings";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Cart from "./components/core/Dashboard/Cart";
import { ACCOUNT_TYPE } from "./utils/constants";
import MyCourses from "./components/core/Dashboard/MyCourses";
import AddCourse from "./components/core/Dashboard/AddCourse";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Catalog from "./pages/Catalog"
import Error from "./pages/Error";
import CourseDetails from "./pages/CourseDetails";
import VideoDetails from "./components/core/ViewCourse/VideoDetails"
import ViewCourse from "./pages/viewCourse"
import Instructor from "./components/core/Dashboard/Instructor"
import AIChat from "./components/core/Dashboard/AIChat/AIChat"

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await apiConnector(
          "GET",
          profileEndpoints.GET_USER_DETAILS_API,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        if (res?.data?.data) {
          dispatch(setUser(res.data.data));
        }
      } catch (e) {
        // If API fails, try to load from localStorage as fallback
        const localUser = localStorage.getItem("user");
        if (localUser) {
          dispatch(setUser(JSON.parse(localUser)));
        }
      }
    };
    if (token) fetchUserDetails();
  }, [token, dispatch]);
  return (
    <div
      className="w-screen min-h-screen bg-richblack-900
                      flex flex-col font-inter"
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About></About>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/catalog/:catalogName" element={<Catalog />} />

        {/* Open Route - for Only Non Logged in User */}
        <Route
          path="/login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />

        <Route
          path="/update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />

        <Route
          path="/verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />

        {/* Private Route - for Only Logged in User */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<MyProfile />} />
          <Route path="my-profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />

          {/* Student Routes - Only show when user is loaded and is a student */}
          {user && user.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route path="enrolled-courses" element={<EnrolledCourses />} />
              <Route path="cart" element={<Cart />} />
              <Route path="ai-chat" element={<AIChat />} />
            </>
          )}

          {/* Route only for Instructors */}
          {user && user.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="instructor" element={<Instructor />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="add-course" element={<AddCourse />} />
              <Route path="edit-course/:courseId" element={<EditCourse />} />

            </>
          )}
        </Route>


          {/* For the watching course lectures */}
          <Route 
            element={
              <PrivateRoute>
                <ViewCourse />
              </PrivateRoute>
            } 
          >
            {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Route
              path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
              element={<VideoDetails />}
            />
          )}
          </Route>



        {/* 404 Page */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
