/**
 * @fileoverview Admin Routes Configuration
 * Implements routes for admin-specific operations including course, lesson, and user management
 * @requires express
 * @requires ../controllers/adminController
 * @requires ../middlewares/private
 * @requires ../middlewares/multer
 */

import express from "express";
import { 
    createCourse, 
    createLesson, 
    deleteLesson, 
    deleteCourse, 
    getAllStats, 
    deleteUser, 
    updateUser,
    unenrollUserFromCourse,
    updateCourse,
    updateLesson
} from "../controllers/adminController.js";
import { isAuthenticated, isAdmin } from "../middlewares/private.js";
import { upload } from "../middlewares/multer.js";

/**
 * Express router instance
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * Course Management Routes
 * @route POST /api/course/create - Create new course
 * @route PUT /api/course/:courseId/update - Update existing course
 * @route DELETE /api/course/:courseId/delete - Delete course
 */
router.post("/course/create", isAuthenticated, isAdmin, upload, createCourse);      
router.put("/course/:courseId/update", isAuthenticated, isAdmin, upload, updateCourse);
router.delete("/course/:courseId/delete", isAuthenticated, isAdmin, deleteCourse);

/**
 * Lesson Management Routes
 * @route POST /api/course/:courseId/lesson/create - Create new lesson
 * @route PUT /api/lesson/:lessonId/update - Update existing lesson
 * @route DELETE /api/lesson/:lessonId/delete - Delete lesson
 */
router.post("/course/:courseId/lesson/create", isAuthenticated, isAdmin, createLesson);
router.put("/lesson/:lessonId/update", isAuthenticated, isAdmin, updateLesson);
router.delete("/lesson/:lessonId/delete", isAuthenticated, isAdmin, deleteLesson);

/**
 * User Management Routes
 * @route DELETE /api/user/:userId/delete - Delete user
 * @route PUT /api/user/:userId/update - Update user details
 * @route DELETE /api/user/:userId/unenroll/:courseId - Unenroll user from course
 */
router.delete("/user/:userId/delete", isAuthenticated, isAdmin, deleteUser);
router.put("/user/:userId/update", isAuthenticated, isAdmin, updateUser);
router.delete("/user/:userId/unenroll/:courseId", isAuthenticated, isAdmin, unenrollUserFromCourse);

/**
 * Statistics Route
 * @route GET /api/stats - Get all platform statistics
 */
router.get("/stats", isAuthenticated, isAdmin, getAllStats);

export default router; 