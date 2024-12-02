/**
 * @fileoverview CourseContext provides state management and operations for courses, lessons, and certifications
 */

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { server } from "../main";
import axios from "axios";

/**
 * @typedef {Object} Course
 * @property {string} _id - Course unique identifier
 * @property {string} title - Course title
 * @property {string} description - Course description
 * @property {string} category - Course category
 * @property {number} price - Course price
 * @property {string} thumbnail - Course thumbnail URL
 * @property {string[]} lessons - Array of lesson IDs
 */

/**
 * @typedef {Object} Lesson
 * @property {string} _id - Lesson unique identifier
 * @property {string} title - Lesson title
 * @property {string} description - Lesson description
 * @property {string} content - Lesson content
 * @property {number} price - Lesson price
 * @property {number} order - Lesson order in course
 */

/**
 * @typedef {Object} CourseContextType
 * @property {Course[]} courses - Array of all courses
 * @property {Course} course - Currently selected course
 * @property {boolean} courseLoading - Loading state for course operations
 * @property {Function} fetchCourses - Fetches all courses
 * @property {Function} fetchCourse - Fetches a specific course
 * @property {Function} fetchLessonsDetails - Fetches details for course lessons
 * @property {Lesson[]} lessonsSellingDetails - Array of lesson details
 * @property {Function} fetchCoursesWithLessons - Fetches courses with their lessons
 * @property {Array} coursesWithLessons - Courses with their lessons
 * @property {Function} fetchLesson - Fetches a specific lesson
 * @property {Lesson} lesson - Currently selected lesson
 * @property {boolean} lessonLoading - Loading state for lesson operations
 * @property {Function} setCertification - Sets certification data
 * @property {Function} fetchCertification - Fetches certification for a course
 * @property {Object} certification - Certification data
 * @property {Function} fetchUserCertifications - Fetches user's certifications
 * @property {Array} userCertifications - User's certifications
 */

/** @type {React.Context<CourseContextType>} */
const CourseContext = createContext();

/**
 * @component
 * @description Provider component that wraps the application to provide course-related functionality
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const CourseContextProvider = ({children}) => { 
    const [courses, setCourses] = useState([]);
    const [course, setCourse] = useState(null);
    const [lessonsSellingDetails, setLessonsSellingDetails] = useState([]);
    const [coursesWithLessons, setCoursesWithLessons] = useState([]);
    const [lesson, setLesson] = useState(null);
    const [certification, setCertification] = useState(null);
    const [userCertifications, setUserCertifications] = useState([]);

    const [courseLoading, setCourseLoading] = useState(false);
    const [lessonLoading, setLessonLoading] = useState(false);
    
    /**
     * Fetches a specific course by ID
     * @async
     * @function fetchCourse
     * @param {string} courseId - Course identifier
     * @returns {Promise<Course|null>} The fetched course or null if not found
     */
    async function fetchCourse(courseId) {
        setCourseLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/course/${courseId}`); 
            setCourse(data.course);
            return data.course;

        } catch (error) {
            console.log(error);
            return null;
        } finally {
            setCourseLoading(false); 
        } 
    }

    /**
     * Fetches all courses
     * @async
     * @function fetchCourses
     */
    async function fetchCourses() {
        setCourseLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/courses`);
            setCourses(data.courses);
        } catch (error) {
            console.log(error);
        } finally {
            setCourseLoading(false);
        }
    }

    /**
     * Fetches details for an array of lesson IDs
     * @async
     * @function fetchLessonsDetails
     * @param {string[]} courseLessons - Array of lesson IDs
     */
    async function fetchLessonsDetails(courseLessons) {
        setLessonLoading(true);
        try {
            setLessonsSellingDetails([]);

            const promises = courseLessons.map(lessonId => 
                axios.get(`${server}/api/lesson/${lessonId}/details`)
            );

            const data = await Promise.all(promises);
            const lessonsDetails = data.map(d => d.data.lessonDetails);

            lessonsDetails.sort((a, b) => a.order - b.order);

            setLessonsSellingDetails(lessonsDetails);

        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLessonLoading(false);
        }
    }

    async function fetchCoursesWithLessons(userId) {
        setCourseLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/my-courses/${userId}`,{
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            setCoursesWithLessons(data.coursesWithLessons);
        } catch (error) {
            setCoursesWithLessons([]);
            console.error(error);
        } finally {
            setCourseLoading(false);
        }
    }

    async function fetchLesson(lessonId) {
        setLessonLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/lesson/${lessonId}`,{
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            setLesson(data.lesson);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLessonLoading(false);
        }
    }

    async function fetchCertification(courseId) {
        setCourseLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/certification/${courseId}`,{
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            setCertification(data.certification);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setCourseLoading(false);
        }
    }

    async function fetchUserCertifications() {
        setCourseLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/certifications`,{
                headers: {
                    token: localStorage.getItem("token"),
                },
            });
            setUserCertifications(data.certifications);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setCourseLoading(false);
        }
    }

    useEffect(() => {
        fetchCourses();
    }, []);

    
    
    return (
        <CourseContext.Provider
            value={{
                courses, setCourses,
                course, setCourse,
                courseLoading,
                fetchCourses,
                fetchCourse,
                fetchLessonsDetails, lessonsSellingDetails, setLessonsSellingDetails,
                fetchCoursesWithLessons, coursesWithLessons,
                fetchLesson, lesson, lessonLoading,
                setCertification, fetchCertification, certification,
                fetchUserCertifications, userCertifications,
            }}
        >
            {children}
        </CourseContext.Provider>
    )
}   

/**
 * Custom hook to use the CourseContext
 * @function courseData
 * @returns {CourseContextType} Course context values and functions
 * @throws {Error} If used outside of CourseContextProvider
 */
export const courseData = () => useContext(CourseContext);