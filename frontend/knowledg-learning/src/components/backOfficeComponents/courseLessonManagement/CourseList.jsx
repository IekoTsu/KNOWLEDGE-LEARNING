/**
 * @fileoverview CourseList component displays a list of courses with edit and delete functionality for administrators
 */

import React from 'react'
import { courseData } from '../../../context/CourseContext';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../../context/AdminContext';
import './CoursesManagement.css';

/**
 * @typedef {Object} Course
 * @property {string} _id - Course unique identifier
 * @property {string} title - Course title
 */

/**
 * @component
 * @description Displays a list of all courses with administrative actions (edit/delete)
 * Each course can be edited or deleted, and new courses can be created.
 * Only accessible by administrators.
 * 
 * @example
 * return (
 *   <CourseList />
 * )
 * 
 * @returns {JSX.Element} Rendered course list with administrative controls
 */
const CourseList = () => {
  const navigate = useNavigate();
  const {courses} = courseData();
  const {deleteCourse} = useAdminContext();

  /**
   * Handles course deletion with confirmation
   * @async
   * @function handleDelete
   * @param {string} courseId - ID of the course to delete
   */
  async function handleDelete(courseId) {
    if(window.confirm("Voulez-vous vraiment supprimer ce cours ?")) {
      await deleteCourse(courseId, navigate);
    }
  }

  return (
    <section className='course-list-container'>
        <h2>Cursus</h2>
        <div className='course-list'>
          <ul>
            {courses.map((course) => (
              <li key={course._id}>
                <p>{course.title}</p>
                <div className='course-list-item-actions'>
                  <button 
                    className="common-button" 
                    onClick={() => navigate(`/backoffice/course/${course._id}/edit`)}
                  >
                    Modifier
                  </button>
                  <button 
                    className="common-button delete-btn" 
                    onClick={() => handleDelete(course._id)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button 
            className="common-button" 
            onClick={() => navigate('/backoffice/course/create')}
          >
            Créer un cours
          </button>
        </div>
    </section>
  )
}

export default CourseList