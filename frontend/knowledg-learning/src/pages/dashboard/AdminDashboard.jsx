import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';
import { useEffect, useRef } from 'react';
const AdminDashboard = () => {
    const navigate = useNavigate(); 
    const {stats, getAllStats} = useAdminContext();
    const circleRefs = {
        users: useRef(null),
        courses: useRef(null),
        lessons: useRef(null)
    };

    useEffect(() => {
        getAllStats();

        setTimeout(() => {
            Object.values(circleRefs).forEach(ref => {
                if (ref.current) {
                    ref.current.style.strokeDashoffset = "0";
                }
            });
        }, 100);
    }, []);

    return (
        <section className='admin-dashboard-container'>
        <div className='admin-dashboard'>
            <a onClick={() => navigate('/backoffice/users')}>Gérer les utilisateurs</a>
            <a onClick={() => navigate('/backoffice/courses')}>Gérer les cursus</a>
        </div>
        <hr />
        <h2>Stats</h2>
        <div className='stats-container'>
            
            <div className='stat-container'>
                <div className='stat'>
                    <div className='outer-circle'>
                        <div className='inner-circle'>
                            <div id='number'>
                                {stats.totalUsers}
                            </div>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="160px" height="160px">
                        <defs>
                            <linearGradient id="GradientColor">
                                <stop offset="0%" stopColor="#0074c7"/>
                                <stop offset="100%" stopColor="#00497c"/>
                            </linearGradient>
                        </defs>
                        <circle 
                            ref={circleRefs.users}
                            cx="80" 
                            cy="80" 
                            r="70" 
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <p>Nombre total d'utilisateurs</p>
            </div>
            <div className='stat-container'>
                <div className='stat'>
                    <div className='outer-circle'>
                        <div className='inner-circle'>
                        <div id='number'>
                                {stats.totalCourses}
                            </div>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="160px" height="160px">
                        <defs>
                            <linearGradient id="GradientColor">
                            <stop offset="0%" stopColor="#0074c7"/>
                            <stop offset="100%" stopColor="#00497c"/>
                        </linearGradient>
                    </defs>
                    <circle 
                        ref={circleRefs.courses}
                        cx="80" 
                        cy="80" 
                        r="70" 
                        strokeLinecap="round"
                        />
                    </svg>
                </div>
                <p>Nombre total de cursus</p>
            </div>
            <div className='stat-container'>
                <div className='stat'>
                    <div className='outer-circle'>
                    <div className='inner-circle'>
                        <div id='number'>
                            {stats.totalLessons}
                        </div>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="160px" height="160px">
                    <defs>
                        <linearGradient id="GradientColor">
                            <stop offset="0%" stopColor="#0074c7"/>
                            <stop offset="100%" stopColor="#00497c"/>
                        </linearGradient>
                    </defs>
                    <circle 
                        ref={circleRefs.lessons}
                        cx="80" 
                        cy="80" 
                        r="70" 
                        strokeLinecap="round"
                    />
                </svg>
                </div>
                <p>Nombre total de leçons</p>
            </div>
        </div>
        </section>
    );
};

export default AdminDashboard;  