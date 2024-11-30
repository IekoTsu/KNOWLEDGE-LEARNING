import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { courseData } from '../../../context/CourseContext';
import { useAdminContext } from '../../../context/AdminContext';
import LessonFromAdd from './LessonFromAdd';
import LessonFromEdit from './LessonFromEdit';
import { FaArrowLeft } from 'react-icons/fa';
import './CoursesManagement.css';
import Loading from '../../Loading/loading';
import { server } from '../../../main';

const CourseEdit = () => {
    const navigate = useNavigate();
    const {courseId} = useParams();
    const {
        course, 
        fetchCourse, 
        lessonsSellingDetails, 
        fetchLessonsDetails,
        courseLoading, lessonLoading,
    } = courseData();

    const {deleteLesson, updateCourse, adminLoading} = useAdminContext();
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [updatedCourse, setUpdatedCourse] = useState(null);
    const [showLessonEdit, setShowLessonEdit] = useState(false);
    const [lessonId, setLessonId] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        updateCourse(
            courseId, 
            updatedCourse.title, 
            updatedCourse.description, 
            updatedCourse.category, 
            updatedCourse.price, 
            updatedCourse.thumbnail
        );
        console.log(updatedCourse.thumbnail);
    };

    useEffect(() => {
        fetchCourse(courseId);
    }, [courseId]);

    useEffect(() => {
        if (course) {
            setUpdatedCourse(course);
            fetchLessonsDetails(course.lessons);
        }
    }, [course]);


    const handleLessonEdit = (lesson) => {
        // First, reset the edit state
        setShowLessonEdit(false);
        setLessonId(null);
        
        // Then set the new lesson after a brief delay
        setTimeout(() => {
            setLessonId(lesson._id);
            setShowLessonEdit(true);
        }, 0);
        
        setShowLessonForm(false);
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
            setUpdatedCourse({...updatedCourse, thumbnail: file});
        }
    };

    if (courseLoading) {
        return <Loading />
    }

  return (
    <main className='course-edit-container background-pattern'>

        <div className='course-edit-header'>
            <h2>Edit Course</h2>
            <button className='back-button' onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
        </div>

    <section className='course-edit-forms-container'>
      {updatedCourse && (
        <>
        <form className='course-edit-form' onSubmit={handleSubmit}>
          <label htmlFor='title'>Title</label>
          <input type='text' id='title' defaultValue={updatedCourse.title} onChange={(e) => setUpdatedCourse({...updatedCourse, title: e.target.value})} required />

          <label htmlFor='description'>Description</label>
          <input type='text' id='description' defaultValue={updatedCourse.description} onChange={(e) => setUpdatedCourse({...updatedCourse, description: e.target.value})} required />

          <label htmlFor='category'>Category</label>
          <input type='text' id='category' defaultValue={updatedCourse.category} onChange={(e) => setUpdatedCourse({...updatedCourse, category: e.target.value})} required />

            <div className='input-group-container'>
                {courseLoading ? <Loading /> : (
                    <img 
                        src={thumbnailPreview || `${server}/${updatedCourse.thumbnail}`} 
                        alt='thumbnail' 
                        className='thumbnail-img'
                    />
                )}
                <div className="input-group mb-3"> 
                    <label className='input-group-text' htmlFor='thumbnail'>Photo Miniature</label>
                    <input 
                        type='file' 
                        className='form-control' 
                        id='thumbnail' 
                        onChange={handleThumbnailChange} 
                        accept='image/*' 
                    />
                </div>
            </div>

          <label htmlFor='price'>Price</label>
            <input type='number' id='price' defaultValue={updatedCourse.price} onChange={(e) => setUpdatedCourse({...updatedCourse, price: e.target.value})} required />

          <button className='common-button' type='submit'>Save</button>
        </form>

        <div className='course-lessons-container'>
            {adminLoading || lessonLoading ? <Loading /> : lessonsSellingDetails.length > 0 ? (
                <>
                    <h3>Lessons</h3>
                    <ul className='course-lessons-list'>
                        {lessonsSellingDetails.map((lesson) => (
                            <li key={lesson._id}>
                                <h4>{lesson.title}</h4>
                                <div className='course-lessons-actions'>
                                    <button className='common-button' onClick={() => handleLessonEdit(lesson)}>Edit</button>
                                    <button className='common-button delete-btn' onClick={() => deleteLesson(lesson._id)}>Delete</button>
                                </div>
                            </li>   
                        ))}
                    </ul>    
                </>
            ) : (
                <p>This course has no lessons yet</p>
            )}  
            <button className='common-button' onClick={() => {setShowLessonForm(true); setShowLessonEdit(false)}}>Add Lesson</button>
        </div> 
        </>
      )}

      {showLessonForm && <LessonFromAdd lessons={course.lessons} />}
      {showLessonEdit && (
        <div key={lessonId}>
          <LessonFromEdit maxOrder={course.lessons.length} lessonId={lessonId} />
        </div>
      )}
    </section>
    </main>
  )
}

export default CourseEdit