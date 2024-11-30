import React from 'react'
import "./CourseCard.css"
import { server } from '../../main'
import { useNavigate } from 'react-router-dom'
import { UserData } from '../../context/UserContext'

const CourseCard = ({course}) => {
  const navigate = useNavigate();
  const {user, isAuth} = UserData();
  
  return (
    <div className='course-card' onClick={() => navigate(`/course/${course._id}`)}>
      <img src={`${server}/${course.thumbnail}`} alt={course.title} className='course-thumbnail' />
      <h3 className='course-title'>{course.title}</h3>
      <p className='course-description'>{course.description}</p>
      <p className='course-price'>Price: {course.price} €</p>

      <button className='common-button' onClick={() => navigate(`/course/${course._id}`)}>View Course</button>

      <br />

      {isAuth && user.role === "admin" && (
        <button className='common-button' onClick={() => navigate(`/backoffice/course/${course._id}/edit`)}>Edit Course</button>
      )}
    </div>
  )
}

export default CourseCard
