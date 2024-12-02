/**
 * @fileoverview LessonFormAdd component provides a form interface for adding new lessons to a course
 */

import React, {useState} from 'react' 
import { useAdminContext } from '../../../context/AdminContext';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import './CoursesManagement.css';
import { toast } from 'react-hot-toast';
/**
 * @typedef {Object} LessonFormAddProps
 * @property {string[]} lessons - Array of lesson IDs currently in the course
 */

/**
 * @component
 * @description Form component for adding a new lesson to a course. Includes fields for title,
 * description, HTML content (with code editor), and price. Uses CodeMirror for HTML editing.
 * 
 * @param {LessonFormAddProps} props - Component props
 * 
 * @example
 * return (
 *   <LessonFromAdd lessons={courseLessons} />
 * )
 * 
 * @returns {JSX.Element} Rendered form for adding a new lesson
 */
const LessonFromAdd = ({lessons}) => {
    const {courseId} = useParams();
    const {createLesson} = useAdminContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [price, setPrice] = useState('');

    /**
     * Handles form submission for lesson creation
     * @function handleSubmit
     * @param {Event} e - Form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim() === '') {
            toast.error('Le contenu de la leçon ne peut pas être vide');
            return;
        }
        createLesson(courseId, title, description, content, price, lessons);
    }

    /**
     * Handles changes in the CodeMirror HTML editor
     * @function handleEditorChange
     * @param {string} value - New content from the editor
     */
    const handleEditorChange = (value) => {
        setContent(value);
    };

    return (
        <div className='lesson-form-container'>
            <h3>Ajouter une leçon</h3>
            <form onSubmit={handleSubmit} className='lesson-form'>
                <label htmlFor='title'>Titre</label>
                <input 
                    type='text' 
                    id='title' 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                />

                <label htmlFor='description'>Description</label>
                <input 
                    type='text' 
                    id='description' 
                    onChange={(e) => setDescription(e.target.value)} 
                    required   
                />

                <label htmlFor='content'>Contenu en HTML</label>
                <div className='html-editor-container'>
                    <CodeMirror
                        value={content}
                        height="100%"
                        extensions={[html()]}
                        theme={oneDark}
                        onChange={handleEditorChange}
                    />
                </div>

                <label htmlFor='price'>Prix</label>
                <input 
                    type='number' 
                    id='price' 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                />

                <button 
                    className='common-button' 
                    type='submit' 
                >
                    Ajouter
                </button>
            </form>
        </div>
    )
}

export default LessonFromAdd;
