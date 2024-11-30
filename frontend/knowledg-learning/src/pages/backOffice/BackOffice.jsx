import React from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import UsersList from '../../components/backOfficeComponents/userList/UsersList';
import CourseList from '../../components/backOfficeComponents/courseLessonManagement/CourseList';
import { FaArrowLeft } from 'react-icons/fa';
import './BackOffice.css';

const Backoffice = () => {  
    const {model} = useParams();
    const navigate = useNavigate();

  return (
    <main className='backoffice background-pattern'>
      <div className='backoffice-header'>
        <h1>Backoffice</h1>
        <button className='back-button' onClick={() => navigate(-1)}>
            <FaArrowLeft />
        </button>
      </div>
      {model === "users" && <UsersList />}
      {model === "courses" && <CourseList />}
    </main>
  )
}

export default Backoffice
