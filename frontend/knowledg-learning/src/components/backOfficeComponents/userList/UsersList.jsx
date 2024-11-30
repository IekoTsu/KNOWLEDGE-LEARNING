import React from 'react'
import { useAdminContext } from '../../../context/AdminContext';
import { useEffect, useState } from 'react'; 
import { courseData } from '../../../context/CourseContext';
import { toast } from 'react-hot-toast';
import './UsersList.css';

const UsersList = () => {
    const {users, fetchUsers, updateUser, unenrollUserFromCourse, deleteUser} = useAdminContext();
    const {courses, fetchCourses , fetchCoursesWithLessons, coursesWithLessons} = courseData();
    const [expandedId, setExpandedId] = useState(null);

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        toast.success("Le identifiant de l'utilisateur a été copié");
    }

    useEffect(() => {
        fetchUsers();
        fetchCourses();
    }, []);

    async function handleUnenrollUser(userId, courseId) {
        await unenrollUserFromCourse(userId, courseId);
    }

    async function handleUpdateUser(e, userId) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const role = formData.get('role');
        const course = formData.get('course');

        
        
        await updateUser(userId, name, role, course);
    }

    async function handleDeleteUser(e, userId) {
        e.preventDefault();
        if(window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
            await deleteUser(userId);
        }
    }

    useEffect(() => {
        const handleExpanded = (e) => {
            if (e.target.classList.contains('accordion-button')) {
                const isExpanded = e.target.getAttribute('aria-expanded') === 'true';
                const controlId = e.target.getAttribute('aria-controls');
                setExpandedId(isExpanded ? controlId : null);
            }
        };

        document.addEventListener('click', handleExpanded);
        return () => document.removeEventListener('click', handleExpanded);
    }, []);

  return (
    <section className='users-list'>
      <h2>Liste des utilisateurs</h2>
        <div className='users-list-container'>
            <div className="accordion accordion-flush" id="accordionFlushExample">
                {users.map((user) => (
                    <div className="accordion-item" key={user._id}>
                        <h2 className="accordion-header" onClick={() => fetchCoursesWithLessons(user._id)}>
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#${user._id}`} aria-expanded="false" aria-controls={`${user._id}`}>
                                {user.name} <span placeholder='Copier' className='user-id' onClick={() => copyToClipboard(user._id)}>({user._id})</span>
                            </button>
                            
                        </h2>
                        <div id={`${user._id}`} className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                            <div className="accordion-body">
                                {expandedId === user._id && (
                                    <div className='user-info-container'>
                                        <div className='user-info'>
                                            <p><strong>Email:</strong> {user.email}</p>
                                            {coursesWithLessons.length > 0 && (
                                                <ul><strong>Les cursus:</strong> {coursesWithLessons.map((course) => (
                                                    <li key={course._id}>
                                                        <span>- {course.title}</span>
                                                        <button className='common-button delete-btn' onClick={() => handleUnenrollUser(user._id, course._id)}>Désinscrire l'utilisateur</button>
                                                    </li>
                                                ))}</ul>
                                            )}
                                        </div>
                                        <form className='user-update-form' onSubmit={(e) => handleUpdateUser(e, user._id)}>
                                            <label htmlFor="name">Nom</label>
                                            <input 
                                                type="text" 
                                                id="name" 
                                                name="name"
                                                defaultValue={user.name}
                                            />

                                            <label htmlFor="role">Role</label>
                                            <select 
                                                name="role" 
                                                id="role" 
                                                defaultValue={user.role}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>

                                            <label htmlFor="course">Inscrire l'utilisateur au cursus </label>
                                            <select 
                                                name="course" 
                                                id="course" 
                                                defaultValue=""
                                            >   
                                                <option value="" disabled>Sélectionner un cursus</option>
                                                {courses.map((course) => (
                                                    <option key={course._id} value={course._id}>{course.title}</option>
                                                ))}
                                            </select>
                                            <div className='user-update-form-btn'>
                                                <button className='common-button' type="submit">Mettre à jour</button>
                                                <button className='common-button delete-btn' onClick={(e) => handleDeleteUser(e, user._id)}>Supprimer</button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

export default UsersList