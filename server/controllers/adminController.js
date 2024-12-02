/**
 * @fileoverview Admin Controller
 * Implements administrative operations for courses, lessons, users, and statistics
 * @requires ../models/courseModel
 * @requires ../models/lessonModel
 * @requires ../models/userModel
 * @requires ../models/certificationModel
 * @requires fs
 */

import Course from "../models/courseModel.js";
import tryCatch from "../middlewares/tryCatch.js";
import Lesson from "../models/lessonModel.js";
import User from "../models/userModel.js";
import Certification from "../models/certificationModel.js";
import { rm } from "fs";

/**
 * Create a new course
 * @async
 * @function createCourse
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Course title
 * @param {string} req.body.description - Course description
 * @param {string} req.body.category - Course category
 * @param {number} req.body.price - Course price
 * @param {Object} req.file - Uploaded thumbnail file
 * @returns {Promise<void>}
 */
export const createCourse = tryCatch(async (req, res) => {

    const { title, description, category, price, } = req.body;

    const thumbnail = req.file;

    const course = await Course.create({ 
        title, 
        description, 
        category, 
        price,
        thumbnail: thumbnail.path,
    });

    res.status(201).json({ success: true, message: "Cursus créé avec succès", course });    
}) 

/**
 * Update an existing course
 * @async
 * @function updateCourse
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.params.courseId - Course ID
 * @param {Object} req.file - Updated thumbnail file
 * @returns {Promise<void>}
 */
export const updateCourse = tryCatch(async (req, res) => {
    const { title, description, category, price } = req.body;
    const course = await Course.findById(req.params.courseId);
    const thumbnail = req.file;


    if(!course) return res.status(404).json({ success: false, message: "Cursus non trouvé" });

    course.title = title;
    course.description = description;
    course.category = category;
    course.price = price;

    if(thumbnail){
        if(course.thumbnail){
            rm(course.thumbnail, (err)=>{
                if(err) console.log('Error deleting thumbnail', err);
                console.log(`Thumbnail of course ${course.title} deleted successfully`);
            });
        }
        course.thumbnail = thumbnail.path;
    }

    const courseCertifications = await Certification.find({ course: course._id });
    if(courseCertifications.length > 0){
        for(let i = 0; i < courseCertifications.length; i++){
            courseCertifications[i].title = title;
            await courseCertifications[i].save();
        }
    }

    await course.save();
    res.status(200).json({ success: true, message: "Cursus mis à jour avec succès", course });
})

/**
 * Delete a course and related data
 * @async
 * @function deleteCourse
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.courseId - Course ID
 * @returns {Promise<void>}
 */
export const deleteCourse = tryCatch(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if(!course) return res.status(404).json({ success: false, message: "Cursus non trouvé" });

    const lessons = await Lesson.find({ course: course._id });

    if(lessons.length > 0){
        await Lesson.deleteMany({ course: course._id }); 
    }

    rm(course.thumbnail, ()=>{
        console.log(`Thumbnail of course ${course.title} deleted successfully`);
    });

    await Course.deleteOne({ _id: course._id });

    await Certification.deleteMany({ course: course._id, certified: false });
    await User.updateMany({ enrollment: course._id }, { $pull: { enrollment: course._id } });
    await User.updateMany({ purchasedLessons: { $in: lessons.map(lesson => lesson._id) } },
        { $pull: { purchasedLessons: { $in: lessons.map(lesson => lesson._id) } } 
    });  

    res.status(200).json({ success: true, message: "Cursus supprimé avec succès" });
})

/**
 * Create a new lesson in a course
 * @async
 * @function createLesson
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.params.courseId - Course ID
 * @returns {Promise<void>}
 */
export const createLesson = tryCatch(async (req, res) => { 
    const { title, description, content, price } = req.body;

    const course = await Course.findById(req.params.courseId);

    if(!course) return res.status(404).json({ success: false, message: "Course not found" });

    const users = await User.find({ enrollment: course._id });

    const lesson = await Lesson.create({ title, description, content, price, course: course._id });

    course.lessons.push(lesson._id);

    for(let i = 0; i < users.length; i++){
        users[i].purchasedLessons.push(lesson._id);
        await users[i].save();
    }

    await course.save();

    res.status(201).json({ success: true, message: "Leçon créée avec succès", lessons : course.lessons });

})

/**
 * Update an existing lesson
 * @async
 * @function updateLesson
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.lessonId - Lesson ID
 * @returns {Promise<void>}
 */
export const updateLesson = tryCatch(async (req, res) => {
    const { title, description, content, price, order } = req.body;
    const lesson = await Lesson.findById(req.params.lessonId);

    if(!lesson) return res.status(404).json({ success: false, message: "Leçon non trouvée" });

    lesson.title = title;
    lesson.description = description;
    lesson.content = content;
    lesson.price = price;
    lesson.order = order;

    await lesson.save();    
    const course = await Course.findById(lesson.course);    

    res.status(200).json({ success: true, message: "Leçon mise à jour avec succès", lessons : course.lessons });
})

/**
 * Delete a lesson and update related data
 * @async
 * @function deleteLesson
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.lessonId - Lesson ID
 * @returns {Promise<void>}
 */
export const deleteLesson = tryCatch(async (req, res) => {
    const lesson = await Lesson.findById(req.params.lessonId);

    if(!lesson) return res.status(404).json({ success: false, message: "Leçon non trouvée" });

    await Lesson.deleteOne({ _id: lesson._id });

    await Course.updateOne({ _id: lesson.course }, { $pull: { lessons: lesson._id } });

    await Certification.updateMany({ course: lesson.course }, { $pull: { completedLessons: lesson._id } });

    await User.updateMany({ purchasedLessons: lesson._id }, { $pull: { purchasedLessons: lesson._id } });

    const course = await Course.findById(lesson.course);
        

    res.status(200).json({ success: true, message: "Leçon supprimée avec succès", lessons : course.lessons });    
})

/**
 * Delete a user
 * @async
 * @function deleteUser
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUser = tryCatch(async (req, res) => {
    const user = await User.findById(req.params.userId);
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ success: true, message: "Utilisateur supprimé avec succès" });
})

/**
 * Get platform statistics
 * @async
 * @function getAllStats
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllStats = tryCatch(async (req, res) => {
    const totalCourses = await Course.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalUsers = await User.countDocuments();

    const stats = {
        totalCourses,
        totalLessons,
        totalUsers,
    }

    res.status(200).json({ success: true, stats });    
})  

/**
 * Update user details
 * @async
 * @function updateUser
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.userId - User ID
 * @param {Object} req.body - Request body
 * @returns {Promise<void>}
 */
export const updateUser = tryCatch(async (req, res) => {
    const { name, role, course } = req.body;
    const user = await User.findById(req.params.userId);

    if(!user) return res.status(404).json({ success: false, message: "User not found" });
    user.name = name;
    user.role = role;

    if(course && !user.enrollment.includes(course)){
        const courseObj = await Course.findById(course);
        user.enrollment = [...user.enrollment, course];

        for(let i = 0; i < courseObj.lessons.length; i++){
            user.purchasedLessons.push(courseObj.lessons[i]);
        }

        const certification = await Certification.findOne({ course: courseObj._id, user: user._id });
        if(!certification){
            await Certification.create({ course: courseObj._id, user: user._id, title: courseObj.title, completedLessons: [] });
        }

    }

    await user.save();
    res.status(200).json({ success: true, message: "Utilisateur mis à jour avec succès", user });
})

/**
 * Unenroll user from a course
 * @async
 * @function unenrollUserFromCourse
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.userId - User ID
 * @param {string} req.params.courseId - Course ID
 * @returns {Promise<void>}
 */
export const unenrollUserFromCourse = tryCatch(async (req, res) => {
    const user = await User.findById(req.params.userId);
    const course = await Course.findById(req.params.courseId);
    const lessons = await Lesson.find({ course: course._id });

    user.enrollment = user.enrollment.filter(id => id.toString() !== course._id.toString());
    for(let i = 0; i < lessons.length; i++){
        user.purchasedLessons = user.purchasedLessons.filter(id => id.toString() !== lessons[i]._id.toString());
    }

    await user.save();

    res.status(200).json({ success: true, message: "Utilisateur désinscrit du cursus avec succès" });
})
