import React from 'react'
import "./App.css"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header/header";
import Home from "./pages/home/home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify"; 
import Footer from "./components/footer/footer";
import Account from "./pages/account/Account";
import Loading from "./components/Loading/loading";
import Courses from "./pages/courses/Courses";
import CourseDetails from "./pages/courseDetails/CourseDetails";
import Dashboard from "./pages/dashboard/Dashboard";
import Lesson from "./pages/lesson/Lesson";
import Certifications from "./pages/certifications/Certifications";
import AccountDetails from "./pages/account/AccountDetails";
import ChangePassword from "./pages/account/ChangePassword";
import Backoffice from "./pages/backOffice/BackOffice";
import CourseEdit from "./components/backOfficeComponents/courseLessonManagement/CourseEdit";
import CourseAdd from "./components/backOfficeComponents/courseLessonManagement/CourseAdd";
import { UserData } from './context/UserContext';

/**
 * @typedef {Object} UserDataContext
 * @property {boolean} isAuth - Indicates if user is authenticated
 * @property {boolean} isAdmin - Indicates if user has admin privileges
 * @property {Object} user - Current user data
 * @property {boolean} loading - Loading state of the application
 */

/**
 * Available routes in the application:
 * @route / - Home page
 * @route /login - Login page (redirects to Home if authenticated)
 * @route /register - Registration page (redirects to Home if authenticated)
 * @route /account - User account page (protected)
 * @route /verify - Email verification page
 * @route /courses - Course listing page
 * @route /course/:courseId/:payment? - Course details page
 * @route /dashboard - User dashboard (protected)
 * @route /backoffice/:model - Admin backoffice (admin only)
 * @route /backoffice/course/:courseId/edit - Course editing (admin only)
 * @route /backoffice/course/create - Course creation (admin only)
 * @route /course/:courseId/lesson/:lessonId - Lesson page (protected)
 * @route /certifications - Certifications page (protected)
 * @route /account-details - Account details page (protected)
 * @route /change-password - Password change page (protected)
 */

/**
 * @component
 * @description Main application component that handles routing and layout structure.
 * Contains protected routes for authenticated users and admin-only routes.
 * 
 * @example
 * return (
 *   <App />
 * )
 * 
 * @returns {JSX.Element} The rendered application with routing configuration
 */
const App = () => {
  const {isAuth, isAdmin, user, loading} = UserData();
  return (
    <>
    {loading ? (<Loading />) : 
    (<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header isAuth={isAuth} />
      <main className='main-content'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={isAuth? <Home /> : <Login />} />
          <Route path="/register" element={isAuth? <Home /> : <Register />} />
          <Route path="/account" element={isAuth? <Account user={user} />: <Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId/:payment?" element={<CourseDetails />} />
          <Route path="/dashboard" element={isAuth? <Dashboard /> : <Login />} />
          <Route path="/backoffice/:model" element={isAdmin? <Backoffice /> : <Navigate to="/dashboard" />} />
          <Route path="/backoffice/course/:courseId/edit" element={isAdmin? <CourseEdit /> : <Navigate to="/dashboard" />} />
          <Route path="/backoffice/course/create" element={isAdmin? <CourseAdd /> : <Navigate to="/dashboard" />} />
          <Route path="/course/:courseId/lesson/:lessonId" element={isAuth? <Lesson /> : <Login />} />
          <Route path="/certifications" element={isAuth? <Certifications /> : <Login />} />
          <Route path="/account-details" element={isAuth? <AccountDetails /> : <Login />} />
          <Route path="/change-password" element={isAuth? <ChangePassword /> : <Login />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
    )}
    </>
  );
};

export default App
