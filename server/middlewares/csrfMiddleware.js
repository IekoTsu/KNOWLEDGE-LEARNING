import csrf from "csurf";

const csrfProtection = csrf({
    cookie: {
        key: '_csrf',
        httpOnly: true,
        secure: true,
        sameSite: false,
        maxAge: 2 * 60 * 60 * 1000
    },
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

            // Set the non-HttpOnly cookie for JavaScript access
            res.cookie('XSRF-TOKEN', token, {
                httpOnly: false,
                secure: true,
                sameSite: 'none',
                maxAge: 2 * 60 * 60 * 1000
            });

            // The HttpOnly cookie is handled by csurf internally
            
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
 