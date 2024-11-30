import React, {useState} from 'react' 
import { useAdminContext } from '../../../context/AdminContext';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import './CoursesManagement.css';

const LessonFromAdd = ({lessons}) => {
    const {courseId} = useParams();
    const {createLesson} = useAdminContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        createLesson(courseId, title, description, content, price , lessons);
    }

    const handleEditorChange = (value) => {
        setContent(value);
    };

  return (
    <div className='lesson-form-container'>
      <h3>Add Lesson</h3>
      <form className='lesson-form'>
        <label htmlFor='title'>Title</label>
        <input type='text' id='title' onChange={(e) => setTitle(e.target.value)} required />

        <label htmlFor='description'>Description</label>
        <input type='text' id='description' onChange={(e) => setDescription(e.target.value)} required   />

        <label htmlFor='content'>HTML Content</label>
        <div className='html-editor-container'>
            <CodeMirror
                value={content}
                height="100%"
                extensions={[html()]}
                theme={oneDark}
                onChange={handleEditorChange}
            />
        </div>

        <label htmlFor='price'>Price</label>
        <input type='number' id='price' onChange={(e) => setPrice(e.target.value)} required />

        <button className='common-button' type='submit' onClick={handleSubmit}>Add</button>
      </form>
    </div>
  )
}

export default LessonFromAdd;
