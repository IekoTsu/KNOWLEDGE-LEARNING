/**
 * @fileoverview User Routes Configuration
 * Implements routes for user authentication, profile management, and payment history
 * @requires express
 * @requires ../controllers/userController
 * @requires ../middlewares/private
 */

import express from "express";
import { 
    register,
    verifyUser, 
    login, 
    myProfile, 
    updateProfile, 
    changePassword, 
    getUserPayments, 
    getAllUsers 
} from "../controllers/userController.js";
import { isAuthenticated, isAuthorized, isAdmin } from "../middlewares/private.js";

/**
 * Express router instance
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * Admin Access Route
 * @route GET /api/users - Get all users (admin only)
 */
router.get("/users", isAuthenticated, isAdmin, getAllUsers);

/**
 * Authentication Routes
 * @route POST /api/user/register - Register new user
 * @route POST /api/user/verify - Verify user email
 * @route POST /api/user/login - User login
 */
router.post("/user/register", register); 
router.post("/user/verify", verifyUser);
router.post("/user/login", login);

/**
 * Profile Management Routes
 * @route GET /api/user/me - Get current user profile
 * @route PUT /api/user/update - Update user profile
 * @route PUT /api/user/change-password - Change user password
 */
router.get("/user/me", isAuthenticated, myProfile);
router.put("/user/update", isAuthenticated, updateProfile);
router.put("/user/change-password", isAuthenticated, changePassword);

/**
 * Payment History Route
 * @route GET /api/user/:userId/payments - Get user payment history
 */
router.get("/user/:userId/payments", isAuthenticated, isAuthorized, getUserPayments);

export default router;

