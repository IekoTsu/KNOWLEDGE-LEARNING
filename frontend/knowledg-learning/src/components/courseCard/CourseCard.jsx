/**
 * @fileoverview CourseCard component displays individual course information in a card format
 */

import React from 'react'
import "./CourseCard.css"
import { server } from '../../main'
import { useNavigate } from 'react-router-dom'

/**
 * @typedef {Object} Course
 * @property {string} _id - Course unique identifier
 * @property {string} title - Course title
 * @property {string} description - Course description
 * @property {number} price - Course price
 * @property {string} thumbnail - Course thumbnail path
 */

/**
 * @component
 * @description Displays a course card with thumbnail, title, description, and price.
 * Clicking the card or button navigates to the course details page.
 * 
 * @param {Object} props
 * @param {Course} props.course - Course data to display
 * 
 * @example
 * return (
 *   <CourseCard course={courseData} />
 * )
 * 
 * @returns {JSX.Element} Rendered course card
 */
const CourseCard = ({course}) => {
  const navigate = useNavigate();
  
  return (
    <div className='course-card' onClick={() => navigate(`/course/${course._id}`)}>
      <img 
        src={`${server}/${course.thumbnail}`} 
        alt={course.title} 
        className='course-thumbnail' 
      />
      <h3 className='course-title'>{course.title}</h3>
      <p className='course-description'>{course.description}</p>
      <p className='course-price'>Prix: {course.price} €</p>

      <button 
        className='common-button' 
        onClick={() => navigate(`/course/${course._id}`)}
      >
        Voir le cursus
      </button>
    </div>
  )
}

export default CourseCard
