/**
 * @fileoverview Certification Routes Configuration
 * Implements routes for handling user certifications and lesson validation
 * @requires express
 * @requires ../controllers/certificationController
 * @requires ../middlewares/private
 */

import express from "express";
import { 
    getUserCertifications, 
    getUserCertification, 
    validateLesson 
} from "../controllers/certificationController.js";
import { isAuthenticated } from "../middlewares/private.js";

/**
 * Express router instance
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * Certification Routes
 * @route GET /api/certifications - Get all certifications for authenticated user
 * @route GET /api/certification/:courseId - Get specific certification for a course
 */
router.get("/certifications", isAuthenticated, getUserCertifications);
router.get("/certification/:courseId", isAuthenticated, getUserCertification);

/**
 * Lesson Validation Route
 * @route POST /api/validate-lesson/:lessonId - Validate completion of a specific lesson
 */
router.post("/validate-lesson/:lessonId", isAuthenticated, validateLesson);

export default router;
