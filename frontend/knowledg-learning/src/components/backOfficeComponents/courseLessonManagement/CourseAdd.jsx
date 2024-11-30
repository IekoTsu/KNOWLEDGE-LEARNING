import React, { useState } from 'react'
import { useAdminContext } from '../../../context/AdminContext'
import { useNavigate } from "react-router-dom";
const CourseAdd = () => {
    const navigate = useNavigate();
    const {createCourse} = useAdminContext();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [thumbnail, setThumbnail] = useState(null);   

    const handleSubmit = (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const description = e.target.description.value;
        const category = e.target.category.value;
        const price = e.target.price.value;
        createCourse(title, description, category, price, thumbnail, navigate);
    }

  return (
    <main className='course-add-container'>
      <h2>Create Course</h2>
      <form className='course-add-form' onSubmit={handleSubmit}>
        <label htmlFor='title'>Title</label>
        <input type='text' id='title' onChange={(e) => setTitle(e.target.value)} required />

        <label htmlFor='description'>Description</label>
        <input type='text' id='description' onChange={(e) => setDescription(e.target.value)} required />

        <label htmlFor='category'>Category</label>
        <input type='text' id='category' onChange={(e) => setCategory(e.target.value)} required />

        <label htmlFor='thumbnail'>Thumbnail</label>
        <input type='file' id='thumbnail' onChange={(e) => setThumbnail(e.target.files[0])} required />

        <label htmlFor='price'>Price</label>
        <input type='number' id='price' onChange={(e) => setPrice(e.target.value)} required />

        <button type='submit'>Create</button>
      </form>
    </main>
  )
}

export default CourseAdd