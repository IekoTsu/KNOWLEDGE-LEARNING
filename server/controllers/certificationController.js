/**
 * @fileoverview Certification Controller
 * Implements certification management and lesson validation functionality
 * @requires ../models/certificationModel
 * @requires ../models/courseModel
 */

import tryCatch from "../middlewares/tryCatch.js";
import Certification from "../models/certificationModel.js";
import Course from "../models/courseModel.js";
import { sendCertificationMail } from "../middlewares/sendMail.js";

/**
 * Retrieve all certifications for a user
 * This function fetches all certification records associated with the authenticated user
 * 
 * @async
 * @function getUserCertifications
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If no certifications are found
 */
export const getUserCertifications = tryCatch(async (req, res) => {
    // Find all certifications for the current user
    const certifications = await Certification.find({ user: req.user._id });

    if(!certifications) {
        return res.status(404).json({ 
            success: false, 
            message: "Aucune certification trouvée pour cet utilisateur" 
        });
    }

    res.status(200).json({ success: true, certifications });
});

/**
 * Get a specific certification for a course
 * Retrieves the certification status and progress for a specific course
 * 
 * @async
 * @function getUserCertification
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.courseId - Course ID to get certification for
 * @returns {Promise<void>}
 */
export const getUserCertification = tryCatch(async (req, res) => {
    const courseId = req.params.courseId;
    const user = req.user;

    // Find the specific certification record
    const certification = await Certification.findOne({ 
        user: user._id, 
        course: courseId 
    });
    
    res.status(200).json({ success: true, certification });
});

/**
 * Validate a completed lesson and update certification progress
 * This function:
 * 1. Marks a lesson as completed
 * 2. Updates the certification progress
 * 3. Issues certification if all lessons are completed
 * 4. Sends confirmation email for completed certification
 * 
 * @async
 * @function validateLesson
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.lessonId - ID of the lesson to validate
 * @returns {Promise<void>}
 * @throws {Error} If certification is not found or lesson is already validated
 */
export const validateLesson = tryCatch(async (req, res) => {
    const { lessonId } = req.params;
    const user = req.user;
    
    // Find the course that contains this lesson
    const course = await Course.findOne({ lessons: { $in: lessonId } });

    // Find the user's certification for this course
    const certification = await Certification.findOne({ 
        user: user._id, 
        course: course._id 
    });

    // Check if certification exists
    if(!certification) {
        return res.status(404).json({ 
            success: false, 
            message: "Certification non trouvée" 
        });
    } 
    
    // Check if lesson is already validated
    if(certification.completedLessons.includes(lessonId)) {
        return res.status(400).json({ 
            success: false, 
            message: "Leçon déjà validée" 
        });
    }

    // Add the lesson to completed lessons
    certification.completedLessons.push(lessonId);
    await certification.save();

    // Check if all lessons are completed
    if(certification.completedLessons.length === course.lessons.length) {
        certification.certified = true;
        await certification.save();
    }

    // If certification is complete, send confirmation email
    if(certification.certified) {
        sendCertificationMail(req.user.email, "Félicitations sur votre certification!", {
            name: req.user.name,
            course: course.title,
            certificateId: certification._id,
        });
        return res.status(200).json({ 
            success: true, 
            message: "Félicitations! Vous avez terminé le cursus, un email de confirmation vous a été envoyé.", 
            certification 
        });
    }

    res.status(200).json({ 
        success: true, 
        message: "Leçon validée", 
        certification 
    });
});
