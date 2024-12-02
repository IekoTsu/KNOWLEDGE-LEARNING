/**
 * @fileoverview Authentication and Authorization Middleware
 * Implements user authentication, admin checks, and route authorization
 * @requires jsonwebtoken
 * @requires ../models/userModel
 */

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * Middleware to verify user authentication
 * @async
 * @function isAuthenticated
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if(!token) return res.status(403).json({ 
            success: false, 
            message: "Veuillez d'abord vous connecter" 
        });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if(!user) return res.status(403).json({ 
            success: false, 
            message: "Token is invalid" 
        });

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: "Non autorisé" 
        });
    }
}

/**
 * Middleware to verify admin privileges
 * @async
 * @function isAdmin
 * @param {import('express').Request} req - Express request object with user property
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const isAdmin = async (req, res, next) => {
    try {
        if(req.user.role !== "admin") return res.status(403).json({ 
            success: false, 
            message: "Seuls les administrateurs sont autorisés à accéder à cette route" 
        });
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}   

/**
 * Middleware to verify user authorization for specific routes
 * Checks if the user is either the owner of the resource or an admin
 * @async
 * @function isAuthorized
 * @param {import('express').Request} req - Express request object with user property
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const isAuthorized = async (req, res, next) => {
    try {
        if(req.user.id.toString() !== req.params.userId && req.user.role !== "admin") 
            return res.status(403).json({ 
                success: false, 
                message: "Vous n'êtes pas autorisé à accéder à cette route" 
            });
        next();
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
