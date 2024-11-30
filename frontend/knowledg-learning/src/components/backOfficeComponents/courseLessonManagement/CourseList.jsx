import React from 'react'
import { courseData } from '../../../context/CourseContext';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../../context/AdminContext';
import './CoursesManagement.css';

const CourseList = () => {
  const navigate = useNavigate();
  const {courses} = courseData();
  const {deleteCourse} = useAdminContext();

  async function handleDelete(courseId) {
    if(window.confirm("Voulez-vous vraiment supprimer ce cours ?")) {
      await deleteCourse(courseId, navigate);
    }
  }

    

  return (
    <section className='course-list-container'>
        <h2>Courses</h2>
        <div className='course-list'>
          <ul>
            {courses.map((course) => (
              <li key={course._id}>
                <p>{course.title}</p>
                <div className='course-list-item-actions'>
                  <button className="common-button" onClick={() => navigate(`/backoffice/course/${course._id}/edit`)}>Edit</button>
                  <button className="common-button delete-btn" onClick={() => handleDelete(course._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
          <button className="common-button" onClick={() => navigate('/backoffice/course/create')}>Create Course</button>
        </div>
    </section>
  )
}

export default CourseList