import csrf from "csurf";

const csrfProtection = csrf({
    cookie: true,
    sameSite: false,
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    value: (req) => {
        const token = 
            req.headers['csrf-token'] || 
            req.headers['x-csrf-token'];
        console.log('Validating token:', token);
        return token;
    }
});

export const generateCsrfToken = (req, res, next) => {
    csrfProtection(req, res, () => {
        try {
            const token = req.csrfToken();
            console.log('Generating new CSRF token:', token);

            // Set both cookies with same settings
            res.cookie('XSRF-TOKEN', token, {
                httpOnly: false,
                secure: true,
                sameSite: false,
                path: '/'
            });

            res.cookie('_csrf', token, {
                httpOnly: true,
                secure: true,
                sameSite: false,
                path: '/'
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
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
};

export const csrfMiddleware = (req, res, next) => {
    console.log('CSRF Middleware - Method:', req.method);
    console.log('CSRF Middleware - Headers:', req.headers);
    console.log('CSRF Middleware - Cookies:', req.cookies);
    
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    csrfProtection(req, res, (err) => {
        if (err) {
            console.error('CSRF Error:', {
                message: err.message,
                code: err.code,
                type: err.type
            });
            return res.status(403).json({
                success: false,
                message: "CSRF token validation failed",
                details: process.env.NODE_ENV === 'development' ? {
                    error: err.message,
                    code: err.code,
                    type: err.type
                } : undefined
            });
        }
        next();
    });
};
 