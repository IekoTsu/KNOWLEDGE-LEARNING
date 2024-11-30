import React from 'react'
import { courseData } from '../../context/CourseContext'
import CourseCard from '../../components/courseCard/CourseCard'
import "./Courses.css"

const Courses = () => { 
    const { courses } = courseData();
  return (
    <main className='background-pattern'>
      <div className='courses-container'>
          <h2>Cours disponibles</h2>

          <div className='courses-list'>
              {
                courses && courses.length > 0 ? courses.map((course) => (
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
 