import csrf from "csurf";

const csrfProtection = csrf({
    cookie: {
        key: '_csrf',  // Specific cookie name
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 2 * 60 * 60 * 1000
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    value: (req) => {
        const token = 
            req.headers['csrf-token'] || 
            req.headers['x-csrf-token'] || 
            req.headers['xsrf-token'] ||
            req.headers['x-xsrf-token'];
            
        console.log('Received CSRF token:', token);
        console.log('Request headers:', req.headers);
        return token;
    }
});

export const csrfMiddleware = (req, res, next) => {
    console.log('CSRF Middleware - Method:', req.method);
    console.log('CSRF Middleware - Headers:', req.headers);
    console.log('CSRF Middleware - Cookies:', req.cookies);
    
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

export const generateCsrfToken = (req, res, next) => {
    csrfProtection(req, res, () => {
        try {
            const token = req.csrfToken();
            console.log('Generating new CSRF token:', token);

            // Set both cookies to be safe
            res.cookie('XSRF-TOKEN', token, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 2 * 60 * 60 * 1000
            });
            
            res.cookie('_csrf', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 2 * 60 * 60 * 1000
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
 