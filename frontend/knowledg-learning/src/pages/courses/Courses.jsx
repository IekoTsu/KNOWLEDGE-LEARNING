/**
 * @fileoverview Courses page component displays all available courses
 */

import React from 'react'
import { courseData } from '../../context/CourseContext'
import CourseCard from '../../components/courseCard/CourseCard'
import "./Courses.css"

/**
 * @component
 * @description Renders a page displaying all available courses using CourseCard components.
 * Fetches course data from CourseContext and handles empty states.
 * 
 * Features:
 * - Displays list of available courses
 * - Shows "Aucun cours trouvé" message when no courses are available
 * - Uses CourseCard component for consistent course display
 * 
 * @example
 * return (
 *   <Courses />
 * )
 * 
 * @returns {JSX.Element} Rendered courses page
 */
const Courses = () => { 
    const { courses } = courseData();
    
    return (
        <main className='background-pattern'>
            <div className='courses-container'>
                <h2>Cursus disponibles</h2>

                <div className='courses-list'>
                    {courses && courses.length > 0 ? 
                        courses.map((course) => (
                            <CourseCard key={course._id} course={course} />
                        ))
                        : <h2>Aucun cours trouvé</h2>
                    }
                </div>
            </div>
        </main>
    )
}

export default Courses
 