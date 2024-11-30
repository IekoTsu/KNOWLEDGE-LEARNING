import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { server } from "../main";
import axios from "axios";

const CourseContext = createContext();

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
    
    async function fetchCourse(courseId) {
        setCourseLoading(true);
        try {
            const {data} = await axios.get(`${server}/api/course/${courseId}`); 
            setCourse(data.course);

        } catch (error) {
            console.log(error);
        } finally {
            setCourseLoading(false); 
        } 
    }

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

export const courseData = () => useContext(CourseContext);