import React, { useEffect, useState, useRef } from 'react'
import './Certifications.css'
import { courseData } from '../../context/CourseContext';
import { LiaCertificateSolid } from "react-icons/lia";
import { GiDiploma } from "react-icons/gi";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/loading';

const Certifications = () => {
    const navigate = useNavigate();
    const {fetchUserCertifications, userCertifications, fetchCourse, courseLoading} = courseData();
    const [courses, setCourses] = useState([]);
    const processRef = useRef(null);

    useEffect(() => {
        fetchUserCertifications();
    }, []);

    useEffect(() => {
        let isMounted = true;
        
        const loadCourses = async () => {
            if (!userCertifications) return;
            
            if (processRef.current) {
                clearTimeout(processRef.current);
            }

            processRef.current = setTimeout(async () => {
                try {
                    const newCourses = [];
                    
                    for (const cert of userCertifications) {
                        const fetchedCourse = await fetchCourse(cert.course);
                        
                        if (!isMounted) return;

                        if (fetchedCourse) {
                            const completedLessons = cert?.completedLessons?.length || 0;
                            const totalLessons = fetchedCourse?.lessons?.length || 1;
                            const progressPercentage = (completedLessons / totalLessons) * 100;

                            newCourses.push({
                                course: fetchedCourse,
                                certification: cert,
                                progress: `${completedLessons} / ${totalLessons}`,
                                progressPercentage: progressPercentage
                            });
                        } else {
                            newCourses.push({
                                course: "Ce cursus n'existe plus",
                                certification: cert
                            });
                        }
                    }

                    if (isMounted) {
                        setCourses(newCourses);
                    }
                } catch (error) {
                } finally {
                    if (isMounted) {
                        processRef.current = null;
                    }
                }
            }, 100);
        };
         
        loadCourses();
        
        return () => {
            isMounted = false;
            if (processRef.current) {
                clearTimeout(processRef.current);
            }
        };
    }, [userCertifications]);
    
  return (
    <main className='certifications-main background-pattern'>
        <section className='certifications-container'>
            <div className='certifications-header'>
                <h1>Certifications et progression</h1>
                <button className='back-button' onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
            </div>
            {courses.length > 0 ? (
                courses.map((currentCourse) => (
                    <div className='certification-card' key={currentCourse.certification._id}>
                        <h2>Cursus : {currentCourse.certification.title} {currentCourse.certification.certified && <span><LiaCertificateSolid /></span>}</h2>
                        <>
                            {currentCourse.certification.certified ? (
                                <div className='certified'>
                                    <p>Certification {'aAiIoOuUyYeE'.includes(currentCourse.certification.title[0]) ? "d'" + currentCourse.certification.title.toLowerCase() : "de " + currentCourse.certification.title.toLowerCase()} <span><GiDiploma /></span></p>
                                </div>
                            ) : (
                                <div className='not-certifed'>
                                        <div className="progress-container">
                                            <div className="skill-box">
                                                <div className='progress-header'>
                                                    <span className="progress-title">Votre progression</span>
                                                    <span className="progress-details">{currentCourse.progress} Leçons</span>
                                                </div>
    
                                                <div className="skill-bar">
                                                    <span 
                                                        className="skill-per" 
                                                        style={{width: `${currentCourse.progressPercentage}%`}}
                                                    >
                                                        <span className="tooltip">{Math.round(currentCourse.progressPercentage)}%</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                            )}       
                        </>
                    </div>
                ))
            ) : courseLoading ? (
                <div className='loading-container' style={{backgroundColor: '#ffffff', padding: '30px', borderRadius: '10px'}}>
                    <Loading />
                </div>
            ) : (
                <h2>Vous n'etes pas inscrit à aucun cours</h2>
            )}
        </section>
        
    </main>
  )
}

export default Certifications
