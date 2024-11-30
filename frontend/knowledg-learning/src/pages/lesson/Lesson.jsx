import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { courseData } from '../../context/CourseContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { server } from '../../main';
import { FaCheck, FaArrowLeft } from "react-icons/fa";
import "./Lesson.css";
import DOMPurify from 'dompurify';

const Lesson = () => {
    const {lessonId} = useParams();
    const {courseId} = useParams();
    const {fetchLesson ,lesson, certification, setCertification, fetchCertification} = courseData();
    const navigate = useNavigate();
    const validateLesson = async () => {
        try{
            const response = await axios.post(`${server}/api/validate-lesson/${lessonId}`, {}, {
                headers: {
                    token: localStorage.getItem("token")
                },
            });
            toast.success(response.data.message);
            if(response.data.certification){
                setCertification(response.data.certification);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    useEffect(() => {
        fetchLesson(lessonId);
        fetchCertification(courseId);
    }, [lessonId, courseId]);

  return (
    <main className='lesson-main background-pattern'>
        <section className='lesson-container'>
            <button className='back-button' onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <>
                {lesson ? (
                    <>
                        <h1 className='lesson-title'>lesson n°{lesson.order} : {lesson.title}</h1>
                        <p className='lesson-description'>
                            <span>Sujet:</span> {lesson.description}
                        </p>
                        <p className='lesson-content' 
                           dangerouslySetInnerHTML={{ 
                             __html: DOMPurify.sanitize(lesson.content) 
                           }}>
                        </p>
                    </>
                ) : (
                    <h1>Loading...</h1>
                )}
            </>
            <>
                {certification?.completedLessons.includes(lessonId) ? (
                    <button 
                        className='common-button validated-button' 
                        disabled
                    >
                        Lesson valide 
                        <FaCheck className="check-icon" />
                    </button>
                ) : (
                    <button 
                        className='common-button' 
                        onClick={validateLesson}
                    >
                        Validate Lesson
                    </button>
                )}
            </>
        </section>
    </main>
  )
}

export default Lesson
