/**
 * @fileoverview AdminContext provides administrative functionality for user and course management
 */

import { createContext, useContext, useState } from "react";
import axios from "axios";
import { server } from "../main";
import { toast } from "react-hot-toast";
import { courseData } from "./CourseContext";

/**
 * @typedef {Object} User
 * @property {string} _id - User's unique identifier
 * @property {string} name - User's name
 * @property {string} email - User's email
 * @property {string} role - User's role (admin/user)
 * @property {Array} courses - Array of courses user is enrolled in
 */

/**
 * @typedef {Object} AdminContextType
 * @property {User[]} users - Array of all users
 * @property {Function} fetchUsers - Fetches all users from the server
 * @property {Function} updateUser - Updates user information
 * @property {Function} unenrollUserFromCourse - Removes user from a course
 * @property {Function} deleteUser - Deletes a user
 * @property {Function} createLesson - Creates a new lesson
 * @property {Function} deleteLesson - Deletes a lesson
 * @property {Function} updateLesson - Updates lesson information
 * @property {Function} updateCourse - Updates course information
 * @property {Function} createCourse - Creates a new course
 * @property {Function} deleteCourse - Deletes a course
 * @property {boolean} adminLoading - Loading state for admin operations
 * @property {Object} stats - Statistics data
 * @property {Function} getAllStats - Fetches all statistics
 */

/** @type {React.Context<AdminContextType>} */
const AdminContext = createContext();

/**
 * @component
 * @description Provider component that wraps the application to provide admin functionality
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AdminContextProvider = ({children}) => {
    const [users, setUsers] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [stats, setStats] = useState({});
    const {fetchCourses, fetchLessonsDetails, fetchCourse} = courseData();

    /**
     * Fetches all users from the server
     * @async
     * @function fetchUsers
     */
    async function fetchUsers() {
        try {
            const {data} = await axios.get(`${server}/api/users`, {
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            setUsers(data.users);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Updates user information
     * @async
     * @function updateUser
     * @param {string} userId - User's ID
     * @param {string} name - New name
     * @param {string} role - New role
     * @param {string} course - Course ID
     */
    async function updateUser(userId, name, role, course) {
        try {
            const {data} = await axios.put(`${server}/api/user/${userId}/update`, {name, role, course}, {
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            toast.success(data.message);
            fetchUsers();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Removes a user from a course
     * @async
     * @function unenrollUserFromCourse
     * @param {string} userId - User's ID
     * @param {string} courseId - Course ID
     */
    async function unenrollUserFromCourse(userId, courseId) {
        try {
            const {data} = await axios.delete(`${server}/api/user/${userId}/unenroll/${courseId}`, {
                headers: {token: localStorage.getItem("token")}
            });
            toast.success(data.message);
            fetchUsers();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Creates a new course
     * @async
     * @function createCourse
     * @param {string} title - Course title
     * @param {string} description - Course description
     * @param {string} category - Course category
     * @param {number} price - Course price
     * @param {File} thumbnail - Course thumbnail image
     * @param {Function} navigate - Navigation function
     */
    async function createCourse(title, description, category, price, thumbnail, navigate) {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("price", price);
            formData.append("file", thumbnail);
            const {data} = await axios.post(`${server}/api/course/create`, formData, {
                headers: {token: localStorage.getItem("token")}
            });
            fetchCourses();
            navigate("/backoffice/courses");
            toast.success(data.message);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Deletes a user
     * @async
     * @function deleteUser
     * @param {string} userId - User's ID
     */
    async function deleteUser(userId) {
        try {
            const {data} = await axios.delete(`${server}/api/user/${userId}/delete`, {
                headers: {token: localStorage.getItem("token")}
            });
            toast.success(data.message);
            fetchUsers();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Deletes a course
     * @async
     * @function deleteCourse
     * @param {string} courseId - Course ID
     * @param {Function} navigate - Navigation function
     */
    async function deleteCourse(courseId, navigate) {
        try {
            const {data} = await axios.delete(`${server}/api/course/${courseId}/delete`, {
                headers: {token: localStorage.getItem("token")}
            });
            toast.success(data.message);
            fetchCourses();
            navigate("/backoffice/courses");
        } catch (error) {
            console.log(error);
            toast.error("échec de la suppression du cursus");
        }
    }

    /**
     * Creates a new lesson
     * @async
     * @function createLesson
     * @param {string} courseId - Course ID
     * @param {string} title - Lesson title
     * @param {string} description - Lesson description
     * @param {string} content - Lesson content
     * @param {number} price - Lesson price
     * @param {Array} lessons - Array of lessons
     */
    async function createLesson(courseId, title, description, content, price, lessons) {
        setAdminLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/course/${courseId}/lesson/create`, {title, description, content, price}, {
                headers: {token: localStorage.getItem("token")}
            });
            toast.success(data.message);
            fetchLessonsDetails(data.lessons);
        } catch (error) {
            console.log(error);
        } finally {
            setAdminLoading(false);
        }
    }

    /**
     * Deletes a lesson
     * @async
     * @function deleteLesson
     * @param {string} lessonId - Lesson ID
     */
    async function deleteLesson(lessonId) {
        setAdminLoading(true);
        try {
            const {data} = await axios.delete(`${server}/api/lesson/${lessonId}/delete`, {
                headers: {token: localStorage.getItem("token")}
            });

            toast.success(data.message);
            fetchLessonsDetails(data.lessons);
        } catch (error) {
            console.log(error);
        } finally {
            setAdminLoading(false);
        }
    }

    /**
     * Updates a lesson
     * @async
     * @function updateLesson
     * @param {string} lessonId - Lesson ID
     * @param {string} title - Lesson title
     * @param {string} description - Lesson description
     * @param {string} content - Lesson content
     * @param {number} price - Lesson price
     * @param {number} order - Lesson order
     */
    async function updateLesson(lessonId, title, description, content, price, order) {
        setAdminLoading(true);
        try {
            const {data} = await axios.put(`${server}/api/lesson/${lessonId}/update`, {title, description, content, price, order}, {
                headers: {token: localStorage.getItem("token")}
            });
            toast.success(data.message);
            fetchLessonsDetails(data.lessons);
        } catch (error) {
            console.log(error);
        } finally {
            setAdminLoading(false);
        }
    }

    /**
     * Updates a course
     * @async
     * @function updateCourse
     * @param {string} courseId - Course ID
     * @param {string} title - Course title
     * @param {string} description - Course description
     * @param {string} category - Course category
     * @param {number} price - Course price
     * @param {File} thumbnail - Course thumbnail image
     */
    async function updateCourse(courseId, title, description, category, price, thumbnail) {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("price", price);
            if(thumbnail){
                formData.append("file", thumbnail);
            }
            const {data} = await axios.put(`${server}/api/course/${courseId}/update`, formData, {
                headers: {token: localStorage.getItem("token")}
            });
            toast.success(data.message);
            fetchCourse(courseId);
        } catch (error) {
            console.log(error);
            if(error.response?.data?.message){
                toast.error(error.response.data.message);
            } else {
                toast.error("échec de la mise à jour du cursus");
            }
        }
    }

    /**
     * Fetches all statistics
     * @async
     * @function getAllStats
     */
    async function getAllStats() {
        setAdminLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/stats`, {
                headers: {token: localStorage.getItem("token")}
            });
            setStats(data.stats);
        } catch (error) {
            console.log(error);
        } finally {
            setAdminLoading(false);
        }
    }

    return (
        <AdminContext.Provider value={{
            users, fetchUsers, updateUser, unenrollUserFromCourse, deleteUser, 
            createLesson, deleteLesson, updateLesson,
            updateCourse, createCourse, deleteCourse,
            adminLoading, stats, getAllStats
        }}>
            {children}
        </AdminContext.Provider>
    );
};

/**
 * Custom hook to use the AdminContext
 * @function useAdminContext
 * @returns {AdminContextType} Admin context values and functions
 * @throws {Error} If used outside of AdminContextProvider
 */
export const useAdminContext = () => useContext(AdminContext);
 