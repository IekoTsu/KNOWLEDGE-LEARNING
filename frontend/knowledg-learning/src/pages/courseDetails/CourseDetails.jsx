/**
 * @fileoverview CourseDetails page component displays detailed information about a specific course
 */

import React, { useEffect, useState, useRef } from 'react'
import "./CourseDetails.css"
import { server } from '../../main'
import { UserData } from '../../context/UserContext'    
import { useNavigate, useParams } from 'react-router-dom'
import { courseData } from '../../context/CourseContext'
import { loadStripe } from '@stripe/stripe-js';
import { FaArrowLeft } from 'react-icons/fa';
import Loading from '../../components/Loading/loading';
import toast from 'react-hot-toast';
import axios from 'axios';

/**
 * @component
 * @description Displays detailed information about a course, including lessons, pricing,
 * and purchase options. Handles course and lesson purchases through Stripe integration.
 * Shows payment status toasts and manages user enrollment states.
 * 
 * Features:
 * - Course thumbnail and details
 * - Individual lesson purchase options
 * - Full course enrollment option
 * - Payment processing through Stripe
 * - Admin edit access
 * - Payment status notifications
 * 
 * @example
 * return (
 *   <CourseDetails />
 * )
 * 
 * @returns {JSX.Element} Rendered course details page
 */
const CourseDetails = () => {
    const {user, isAuth} = UserData();
    const {course, fetchCourse, lessonsSellingDetails, fetchLessonsDetails, courseLoading} = courseData();
    const {courseId, payment} = useParams();
    const navigate = useNavigate();
    const paymentToastShown = useRef(false);

    /**
     * Handles payment status notifications on component mount
     */
    useEffect(() => {
        if (payment && !paymentToastShown.current) {
            paymentToastShown.current = true;
            if (payment === "success") {
                toast.success("Paiement effectué avec succès");
            } else if (payment === "fail") {
                toast.error("Paiement annulé");
            }
            navigate(`/course/${courseId}`, { replace: true });
        }
    }, [payment]);

    /**
     * Fetches course data on component mount or courseId change
     */
    useEffect(() => {
        async function fetchData(){
            await fetchCourse(courseId);
        }
        fetchData();
    }, [courseId]);

    /**
     * Fetches lesson details when course data is available
     */
    useEffect(() => {
        async function fetchLessons() {
            if (course?.lessons && course.lessons.length > 0) {
                await fetchLessonsDetails(course.lessons);
            }
        }
        fetchLessons();
    }, [course?._id]);

    /**
     * Handles checkout process for course or lesson purchase
     * @async
     * @function checkoutHandler
     * @param {string|null} lessonId - ID of lesson to purchase, null for full course purchase
     */
    const checkoutHandler = async (lessonId = null) => {
        try {
            const stripe = await loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY);
            let response;

            if(lessonId !== null) {
                response = await axios.post(`${server}/api/purchase/lesson/${lessonId}`, {}, {
                    headers: {
                        token: localStorage.getItem("token")
                    }
                })
            } else {
                response = await axios.post(`${server}/api/purchase/${courseId}`, {}, {
                    headers: {
                        token: localStorage.getItem("token")
                    }   
                })
            }

            await stripe.redirectToCheckout({ 
                sessionId: response.data.session.id,
            });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <main className="background-pattern">
            {courseLoading ? (
                <div className='loading-container' style={{backgroundColor: '#ffffff', padding: '30px', borderRadius: '10px'}}>
                    <Loading />
                </div>
            ) : course && (
                <section className='course-details-section'>
                    <div className='course-details-container'>
                        <div className='course-details-header'> 
                            <button className='back-button' onClick={() => navigate(-1)}>
                                <FaArrowLeft />
                            </button>
                        </div>
                        <img src={`${server}/${course.thumbnail}`} alt={course.title} className='course-thumbnail' />
                        
                        <div className='course-details'>
                            <h1 className='course-title'>{course.title}</h1>
                            <p className='course-description'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p> 
                            <table className="lessons-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Liste des leçons</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lessonsSellingDetails.length > 0 ? (
                                        lessonsSellingDetails.map((lesson) => (
                                            <tr key={lesson._id}>
                                                <td className="icon-cell">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                    </svg>
                                                </td>
                                                <td className="title-cell">Lesson nº{lesson.order}: {lesson.title}</td>
                                                <td className="price-cell">{lesson.price} €</td>
                                                <td className="action-cell">
                                                    {
                                                        user?.purchasedLessons?.includes(lesson._id) ? (
                                                            <button className='common-button btn' onClick={() => navigate(`/course/${courseId}/lesson/${lesson._id}`)}>Commencer la leçon</button>
                                                        ) : (
                                                            <button className='common-button btn' onClick={() => checkoutHandler(lesson._id)}>Acheter la leçon</button>
                                                        )
                                                    }
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{textAlign: 'center'}}>Aucune leçon trouvée</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <p className='course-price'>Prix: {course.price} €</p>

                            {isAuth && user.role === "admin" && (
                                <button className='common-button' onClick={() => navigate(`/backoffice/course/${course._id}/edit`)}>Modifier le cursus</button>
                            )}
                            
                            <>
                                {
                                    user?.enrollment?.includes(course._id) ? (
                                        <button className='common-button' onClick={() => navigate(`/dashboard`)}>Commencer la leçon</button>
                                    ) : (
                                        <button onClick={() => checkoutHandler()} className='common-button'>S'inscrire au cursus</button>
                                    )
                                }
                            </>
                        </div>
        
                    </div> 
                </section>
            )}
        </main>
    )
}

export default CourseDetails
