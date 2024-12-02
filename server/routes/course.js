/**
 * @fileoverview Course Routes Configuration
 * Implements routes for course management, lesson access, and purchase operations
 * @requires express
 * @requires ../controllers/courseController
 * @requires ../middlewares/private
 */

import express from "express";
import { 
    getAllCourses, 
    getCourseById, 
    getLessonsByCourseId, 
    getLessonById, 
    getUserCourses, 
    purchaseCourse, 
    coursePaymentSuccess,
    paymentCancel,
    getLessonSellingDetails,
    purchaseLesson,
    lessonPaymentSuccess,
} from "../controllers/courseController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/private.js";

/**
 * Express router instance
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * Course Access Routes
 * @route GET /api/courses - Get all available courses
 * @route GET /api/course/:courseId - Get specific course details
 * @route GET /api/my-courses/:userId - Get user's enrolled courses
 */
router.get("/courses", getAllCourses);
router.get("/course/:courseId", getCourseById);  
router.get("/my-courses/:userId", isAuthenticated, isAuthorized, getUserCourses);

/**
 * Lesson Access Routes
 * @route GET /api/course/:courseId/lessons - Get all lessons for a course
 * @route GET /api/lesson/:lessonId - Get specific lesson details
 * @route GET /api/lesson/:lessonId/details - Get lesson selling details
 */
router.get("/course/:courseId/lessons", isAuthenticated, getLessonsByCourseId);
router.get("/lesson/:lessonId", isAuthenticated, getLessonById);
router.get("/lesson/:lessonId/details", getLessonSellingDetails);

/**
 * Purchase Routes
 * @route POST /api/purchase/:courseId - Purchase a course
 * @route POST /api/purchase/lesson/:lessonId - Purchase a single lesson
 */
router.post("/purchase/:courseId", isAuthenticated, purchaseCourse);
router.post("/purchase/lesson/:lessonId", isAuthenticated, purchaseLesson);

/**
 * Payment Status Routes
 * @route GET /api/course/payment/success - Handle successful course payment
 * @route GET /api/lesson/payment/success - Handle successful lesson payment
 * @route GET /api/payment/cancel - Handle cancelled payment
 */
router.get("/course/payment/success", coursePaymentSuccess);
router.get("/lesson/payment/success", lessonPaymentSuccess);
router.get("/payment/cancel", paymentCancel);   

export default router;  