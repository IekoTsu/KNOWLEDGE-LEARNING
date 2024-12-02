/**
 * @fileoverview Dashboard page component for displaying user's courses and lessons
 */

import React, { useEffect } from 'react'
import { FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { UserData } from '../../context/UserContext';
import { courseData } from '../../context/CourseContext'; 
import { CgProfile } from "react-icons/cg";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import Loading from '../../components/Loading/loading';
import "./Dashboard.css";

/**
 * @component
 * @description Renders the user dashboard showing enrolled courses and their lessons.
 * Provides different views for admin and regular users. Shows lesson completion status
 * and navigation options.
 * 
 * Features:
 * - Course listing with accordion view
 * - Lesson completion tracking
 * - Admin dashboard access
 * - Profile navigation
 * - Certification progress view
 * 
 * @example
 * return (
 *   <Dashboard />
 * )
 * 
 * @returns {JSX.Element} Rendered dashboard page
 */
const Dashboard = () => {
    const {isAdmin, user} = UserData();
    const {
        coursesWithLessons, 
        fetchCoursesWithLessons, 
        fetchUserCertifications, 
        userCertifications,
        courseLoading
    } = courseData();
    const navigate = useNavigate();

    /**
     * Fetches user's courses and certifications on component mount
     */
    useEffect(() => { 
        fetchCoursesWithLessons(user._id);
        fetchUserCertifications();
    }, []);
    
    return (
        <main className='dashboard-main background-pattern '>
            <section className='dashboard-container'>
                <div className='dashboard-header'>
                    <h1>Tableau de bord</h1>
                    <div className='dashboard-buttons'>
                        <button 
                            className='dashboard-btn' 
                            onClick={() => navigate('/account-details')}
                        >
                            <CgProfile />
                        </button>
                        <button 
                            className='back-button' 
                            onClick={() => navigate(-1)}
                        >
                            <FaArrowLeft />
                        </button>
                    </div>
                </div>
                <div className='dashboard-content'>
                    <div className='dashboard-courses'>
                        {isAdmin ? (<AdminDashboard />) : 
                        (<>
                            <h2>Vos cursus</h2>
                            {coursesWithLessons.length > 0 ? (
                                coursesWithLessons.map((course) => (
                                    <div className="accordion accordion-flush" id="accordionFlushExample" key={course._id}>
                                        <div className="accordion-item">
                                            <h2 className="accordion-header">
                                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#${course._id}`} aria-expanded="false" aria-controls={course._id}>
                                                    {course.title}
                                                </button>
                                            </h2>
                                            <div id={course._id} className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                                                <div className="accordion-body">
                                                    {course.lessons.map((lesson) => (
                                                        <Link to={`/course/${course._id}/lesson/${lesson._id}`} key={lesson._id} className='link-style'>
                                                            <div className="lesson-card">
                                                                <div className='lesson-details'>
                                                                    <h3>Leçon nº {lesson.order}: {lesson.title}</h3>
                                                                    <p>{lesson.description}</p>
                                                                </div>
                                                                <>
                                                                    {userCertifications.some((certification) => certification.course === course._id && certification.completedLessons.includes(lesson._id)) ? (
                                                                        <div className='lesson-buttons'>
                                                                            <button className='common-button validated-button'>Voir la leçon</button>
                                                                            <FaCheck className='check-icon' />
                                                                        </div>
                                                                    ) : (
                                                                        <div className='lesson-buttons'>
                                                                            <button className='common-button'>Commencer la leçon</button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : courseLoading ? (
                                <div className='loading-container' style={{backgroundColor: '#ffffff', padding: '30px', borderRadius: '10px'}}>
                                    <Loading />
                                </div>
                            ) : (
                                <h2>Vous n'avez pas de cursus</h2>
                            )}
                        </>)}
                    </div>
                </div>
                {!isAdmin && (
                    <div className='dashboard-footer'>
                        <button className='common-button' onClick={() => navigate('/certifications')}>Voir vos progressions / certifications</button>
                    </div>
                )}
            </section>
        </main>
    )
}

export default Dashboard