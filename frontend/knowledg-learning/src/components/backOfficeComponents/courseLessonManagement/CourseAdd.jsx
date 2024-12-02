/**
 * @fileoverview CourseAdd component provides a form interface for administrators to create new courses
 */

import React, { useState } from 'react'
import { useAdminContext } from '../../../context/AdminContext'
import { useNavigate } from "react-router-dom";
import './CoursesManagement.css';

/**
 * @component
 * @description Provides a form for administrators to create new courses with title, description,
 * category, price, and thumbnail image. After successful creation, redirects to the courses list.
 * 
 * @example
 * return (
 *   <CourseAdd />
 * )
 * 
 * @returns {JSX.Element} Rendered form for creating a new course
 */
const CourseAdd = () => {
    const navigate = useNavigate();
    const {createCourse} = useAdminContext();
    const [title, setTitle] = useState(""); 
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [thumbnail, setThumbnail] = useState(null);   
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    /**
     * Handles form submission for course creation
     * @function handleSubmit
     * @param {Event} e - Form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        createCourse(title, description, category, price, thumbnail, navigate);
    }

    /**
     * Handles thumbnail image selection and preview
     * @function handleThumbnailChange
     * @param {Event} e - Input change event
     */
    const handleThumbnailChange = (e) => {
      const file = e.target.files[0];
      setThumbnail(file);
      if (file) {
          setThumbnailPreview(URL.createObjectURL(file));
      }
    };

    return (
        <main className='course-add-container background-pattern'>
            <section className='course-add-section'>
                <h2>Créer un cours</h2>
                <form className='course-add-form' onSubmit={handleSubmit}>
                    <label htmlFor='title'>Titre</label>
                    <input type='text' id='title' onChange={(e) => setTitle(e.target.value)} required />

                    <label htmlFor='description'>Description</label>
                    <input type='text' id='description' onChange={(e) => setDescription(e.target.value)} required />

                    <label htmlFor='category'>Catégorie</label>
                    <input type='text' id='category' onChange={(e) => setCategory(e.target.value)} required />

                    <div className='input-group-container'>
                        {thumbnailPreview && (
                            <img 
                                src={thumbnailPreview} 
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
                                required
                            />
                        </div>
                    </div>

                    <label htmlFor='price'>Prix</label>
                    <input type='number' id='price' onChange={(e) => setPrice(e.target.value)} required />

                    <button type='submit' className='common-button'>Créer</button>
                </form>
            </section>
        </main>
    )
}

export default CourseAdd