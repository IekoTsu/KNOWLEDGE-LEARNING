import doubleCsrf from 'express-csrf-double-submit-cookie';

const { 
    generateToken, 
    doubleCsrfProtection 
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'your-secret-key-here',
    cookieName: 'XSRF-TOKEN',
    cookieOptions: {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    },
    size: 64,
    getTokenFromRequest: (req) => {
        const token = req.headers['csrf-token'] || req.headers['x-csrf-token'];
        console.log('Token from request:', token);
        return token;
    }
});

export const generateCsrfToken = (req, res) => {
    try {
        const token = generateToken(res);
        console.log('Generated new CSRF token:', token);
        
        // Ensure cookie is set properly
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
        });
        
        res.json({ 
            csrfToken: token,
            success: true 
        });
    } catch (error) {
        console.error('Token generation error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to generate CSRF token",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const csrfMiddleware = (req, res, next) => {
    // Skip for non-mutation methods
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    console.log('CSRF Check - Headers:', req.headers);
    console.log('CSRF Check - Cookies:', req.cookies);

    try {
        doubleCsrfProtection(req, res, next);
    } catch (error) {
        console.error('CSRF validation failed:', error);
        return res.status(403).json({
            success: false,
            message: "CSRF token validation failed"
        });
    }
};
 