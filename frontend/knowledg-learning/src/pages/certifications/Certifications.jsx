import React, { useEffect, useState } from 'react'
import './Certifications.css'
import { courseData } from '../../context/CourseContext';
import { LiaCertificateSolid } from "react-icons/lia";
import { GiDiploma } from "react-icons/gi";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Certifications = () => {
    const navigate = useNavigate();
    const {fetchUserCertifications, userCertifications, fetchCourse, course} = courseData();
    const [courses, setCourses] = useState([]);


    useEffect(() => {
        fetchUserCertifications();
    }, []);

    useEffect(() => {
        const loadCourses = async () => {
            if (!userCertifications) return;
            
            try {
                const newCourses = [];
                for(let i = 0; i < userCertifications.length; i++){
                    await fetchCourse(userCertifications[i].course);
                    if(course){
                        newCourses.push({course: course, certification: userCertifications[i]});
                    } else {
                        newCourses.push({course: "Ce cursus n'existe plus", certification: userCertifications[i]});
                    }
                }
                setCourses(newCourses);
            } catch (error) {
                console.error('Erreur lors du chargement des cursus:', error);
            }
        };
         
        loadCourses();
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
                courses.map((course) => (
                    <div className='certification-card' key={course.certification._id}>
                        <h2>Cursus : {course.certification.title} {course.certification.certified && <span><LiaCertificateSolid /></span>}</h2>
                        <>
                            {course.certification.certified ? (
                                <div className='certified'>
                                    <p>Certification {'aiouye'.includes(course.certification.title[0]) ? "d'" + course.certification.title.toLowerCase() : "de " + course.certification.title.toLowerCase()} <span><GiDiploma /></span></p>
                                </div>
                            ) : (
                                <div className='not-certifed'>
                                        <div className="progress-container">
                                            <div className="skill-box">
                                                <div className='progress-header'>
                                                    <span className="progress-title">Votre progression</span>
                                                    <span className="progress-details">{course.certification?.completedLessons?.length || 0} / {course.course?.lessons?.length || 0} leçons terminées</span>
                                                </div>
    
                                                <div className="skill-bar">
                                                    <span className="skill-per" style={{width: `${course.certification?.completedLessons?.length * 100/ course.course?.lessons?.length}%`}}>
                                                        <span className="tooltip">{course.certification?.completedLessons?.length * 100/ course.course?.lessons?.length}%</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                            )}       
                        </>
                    </div>
                ))
            ) : (
                <h2>Vous n'etes pas inscrit à aucun cours</h2>
            )}
        </section>
        
    </main>
  )
}

export default Certifications
