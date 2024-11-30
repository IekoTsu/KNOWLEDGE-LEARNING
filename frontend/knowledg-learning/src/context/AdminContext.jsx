import { createContext, useContext, useState } from "react";
import axios from "axios";
import { server } from "../main";
import { toast } from "react-hot-toast";
import { courseData } from "./CourseContext";

const AdminContext = createContext();


export const AdminContextProvider = ({children}) => {
    const [users, setUsers] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [stats, setStats] = useState({});
    const {fetchCourses ,fetchLessonsDetails, fetchCourse} = courseData();

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
            if(error.response.data.message){
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to update course");
            }
        }
    }

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
            toast.error("Failed to delete course");
        }
    }   

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

export const useAdminContext = () => useContext(AdminContext);
 