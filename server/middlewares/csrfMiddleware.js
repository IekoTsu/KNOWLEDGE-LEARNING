import crypto from 'crypto';

// Generate a random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Validate token
const validateToken = (cookieToken, headerToken) => {
    if (!cookieToken || !headerToken) return false;
    return cookieToken === headerToken;
};

// Generate CSRF token middleware
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

// CSRF protection middleware
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
 