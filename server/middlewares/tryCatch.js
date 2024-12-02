/**
 * @fileoverview Error Handling Middleware
 * Implements a wrapper for route handlers to handle async/await errors
 */

/**
 * Higher-order function that wraps route handlers for error handling
 * @function tryCatch
 * @param {Function} handler - Express route handler function to wrap
 * @returns {Function} Wrapped handler function with error handling
 * @example
 * // Usage in route file:
 * router.post('/route', tryCatch(async (req, res) => {
 *     // Your route logic here
 * }));
 */
const tryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
            console.log(error);
        }
    }
};

export default tryCatch;