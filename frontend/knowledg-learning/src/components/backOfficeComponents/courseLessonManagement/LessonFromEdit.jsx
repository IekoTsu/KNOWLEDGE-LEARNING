/**
 * @fileoverview LessonFromEdit component provides a form interface for editing existing lessons in a course
 */

import React, {useState, useEffect} from 'react'
import { useAdminContext } from '../../../context/AdminContext';
import { courseData } from '../../../context/CourseContext';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import './CoursesManagement.css';

/**
 * @typedef {Object} LessonFromEditProps
 * @property {number} maxOrder - Maximum order value for lessons in the course
 * @property {string} lessonId - ID of the lesson to edit
 */

/**
 * @component
 * @description Form component for editing an existing lesson in a course. Includes fields for title,
 * description, HTML content (with code editor), price, and order. Uses CodeMirror for HTML editing.
 * 
 * @param {LessonFromEditProps} props - Component props
 * 
 * @example
 * return (
 *   <LessonFromEdit maxOrder={courseLessons.length} lessonId={selectedLessonId} />
 * )
 * 
 * @returns {JSX.Element} Rendered form for editing a lesson
 */
const LessonFromEdit = ({maxOrder, lessonId}) => {
    const {updateLesson} = useAdminContext();
    const {fetchLesson, lesson} = courseData();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [price, setPrice] = useState('');
    const [order, setOrder] = useState(''); 

    useEffect(() => {
        setTitle('');
        setDescription('');
        setContent('');
        setPrice('');
        setOrder('');
        
        fetchLesson(lessonId);
    }, [lessonId]);

    useEffect(() => {
        if (lesson) {
            setTitle(lesson.title);
            setDescription(lesson.description);
            setContent(lesson.content);
            setPrice(lesson.price);
            setOrder(lesson.order);
        }
    }, [lesson]);

    /**
     * Handles form submission for lesson update
     * @function handleSubmit
     * @param {Event} e - Form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        updateLesson(lessonId, title, description, content, price, order);
    }
    
    /**
     * Handles changes in the CodeMirror HTML editor
     * @function handleEditorChange
     * @param {string} value - New content from the editor
     */
    const handleEditorChange = (value) => {
        setContent(value);
    }

    return (
        <div className='lesson-form-container'>
            {lesson && (
                <form className='lesson-form'>
                    <label htmlFor='title'>Title</label>
                    <input 
                        type='text' 
                        id='title' 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                    />

                    <label htmlFor='description'>Description</label>
                    <input 
                        type='text' 
                        id='description' 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                    />

                    <label htmlFor='order'>Order</label>
                    <input 
                        type='number' 
                        id='order' 
                        max={maxOrder} 
                        min={1} 
                        value={order} 
                        onChange={(e) => setOrder(e.target.value)} 
                        required 
                    />

                    <label htmlFor='content'>Content</label>
                    <div className='html-editor-container'>
                        <CodeMirror
                            value={content}
                            width="100%"
                            extensions={[html()]}
                            theme={oneDark}
                            onChange={handleEditorChange}
                        />
                    </div>

                    <label htmlFor='price'>Price</label>
                    <input 
                        type='number' 
                        id='price' 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        required 
                    />

                    <button 
                        className='common-button' 
                        type='submit' 
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                </form>
            )}
        </div>
    ) 
}

export default LessonFromEdit