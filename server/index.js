/**
 * @fileoverview Main Express server configuration and setup.
 * This file configures the Express application, sets up middleware,
 * handles routing, and initializes the server and database connection.
 * 
 * @requires express
 * @requires dotenv
 * @requires cors
 * @requires cookie-parser
 * @requires helmet
 * @requires express-rate-limit
 */

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { generateCsrfToken, csrfMiddleware } from "./middlewares/csrfMiddleware.js";
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
dotenv.config();

/**
 * Express application instance
 * @type {import('express').Express}
 */
const app = express();

/**
 * Port number for the server
 * @type {number}
 */
const PORT = process.env.PORT || 5000;

/**
 * CORS configuration for cross-origin requests
 * Allows specified origin, methods, and headers for secure cross-origin communication
 */
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  credentials: true,
  allowedHeaders: ['Content-Type', 'csrf-token',  'token'],
  exposedHeaders: ['set-cookie']
}));

/**
 * Enable trust proxy setting for reverse proxy environments
 * Required for secure operation behind services like Render.com
 */
app.set('trust proxy', 1);

/**
 * Middleware Configuration Section
 * - express.json() for parsing JSON payloads
 * - express.urlencoded() for parsing URL-encoded payloads
 * - cookieParser() for parsing cookies
 * - Static file serving for uploads directory
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads",express.static("uploads"));

/**
 * CSRF Protection Middleware
 * Applies CSRF protection to all non-GET routes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        next();
    } else {
        csrfMiddleware(req, res, next);
    }
});

/**
 * CSRF Token Generation Endpoint
 * Provides CSRF tokens for client-side requests
 */
app.get('/api/csrf-token', generateCsrfToken);

/**
 * Security Headers Configuration
 * Adds various HTTP headers for enhanced security
 */
app.use(helmet());

/**
 * Rate Limiting Configuration
 * Protects against brute force attacks by limiting request frequency
 * @type {import('express-rate-limit').RateLimit}
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

/**
 * Route Imports
 * Importing various route modules for different features
 */
import courseRoutes from "./routes/course.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import certificationRoutes from "./routes/certification.js";

/**
 * Route Configuration
 * Setting up API routes for different features
 */
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api", certificationRoutes);

/**
 * Server Initialization
 * Starts the Express server and establishes database connection
 * @listens {number} PORT
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});