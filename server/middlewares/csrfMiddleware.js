/**
 * @fileoverview CSRF Protection Middleware
 * Implements CSRF token generation and validation for securing cross-site requests
 * @requires crypto
 */

import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token
 * @function generateToken
 * @returns {string} A 32-byte hexadecimal token
 * @private
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Validates the CSRF token from cookie against the token from header
 * @function validateToken
 * @param {string} cookieToken - Token stored in cookie
 * @param {string} headerToken - Token received from request header
 * @returns {boolean} True if tokens match, false otherwise
 * @private
 */
const validateToken = (cookieToken, headerToken) => {
    if (!cookieToken || !headerToken) return false;
    return cookieToken === headerToken;
};

/**
 * Middleware to generate and set CSRF token
 * @function generateCsrfToken
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export const generateCsrfToken = (req, res) => {
    const token = generateToken();
    
    // Set token in cookie
    res.cookie('_csrf', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Send token in response
    res.json({ csrfToken: token });
};

/**
 * Middleware to validate CSRF token
 * @function csrfMiddleware
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const csrfMiddleware = (req, res, next) => {
    // Skip CSRF check for GET requests
    if (req.method === 'GET') {
        return next();
    }

    const cookieToken = req.cookies._csrf;
    const headerToken = req.headers['csrf-token'];

    if (!validateToken(cookieToken, headerToken)) {
        return res.status(403).json({
            success: false,
            message: 'CSRF token validation failed'
        });
    }

    next();
};
 