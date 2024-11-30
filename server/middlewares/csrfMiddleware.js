import { csrfSync } from 'express-csrf-double-submit-cookie';

const { 
    generateToken,
    csrfSynchronisedProtection
} = csrfSync({
    getTokenFromRequest: (req) => {
        return req.headers['csrf-token'] || 
               req.headers['x-csrf-token'];
    },
    cookieName: 'XSRF-TOKEN',
    cookieOptions: {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/'
    }
});

export const generateCsrfToken = (req, res) => {
    try {
        const token = generateToken(res);
        console.log('Generated CSRF token:', token);
        
        res.json({ 
            csrfToken: token,
            success: true 
        });
    } catch (error) {
        console.error('Token generation error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to generate CSRF token"
        });
    }
};

export const csrfMiddleware = (req, res, next) => {
    // Skip CSRF check for these methods
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    console.log('CSRF Check - Headers:', req.headers);
    console.log('CSRF Check - Cookies:', req.cookies);

    csrfSynchronisedProtection(req, res, (error) => {
        if (error) {
            console.error('CSRF validation failed:', error);
            return res.status(403).json({
                success: false,
                message: "CSRF token validation failed"
            });
        }
        next();
    });
};
 