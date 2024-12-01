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
import Backoffice from "./pages/backOffice/Backoffice";
import CourseEdit from "./components/backOfficeComponents/courseLessonManagement/CourseEdit";
import CourseAdd from "./components/backOfficeComponents/courseLessonManagement/CourseAdd";
import { UserData } from './context/UserContext';


const App = () => {
  const {isAuth, isAdmin, user, loading} = UserData();
  return (
    <>
    {loading ? (<Loading />) : 
    (<BrowserRouter>
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
