import doubleCsrf from 'express-csrf-double-submit-cookie';

const { 
    generateToken, 
    doubleCsrfProtection 
} = doubleCsrf({
    getSecret: () => 'your-secret-key-here', // You should use an environment variable for this
    cookieName: 'XSRF-TOKEN',
    cookieOptions: {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        path: '/'
    },
    size: 64,
    getTokenFromRequest: (req) => req.headers['csrf-token'] || req.headers['x-csrf-token']
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
 