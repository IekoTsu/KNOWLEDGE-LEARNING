import csrf from "csurf";

// Initialize CSRF protection
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 2 * 60 * 60 * 1000
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    value: (req) => req.headers['csrf-token']
});

// Middleware wrapper to handle CSRF errors
export const csrfMiddleware = (req, res, next) => {
    csrfProtection(req, res, (err) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "CSRF token validation failed"
            });
        }
        next();
    });
};

// Generate CSRF token middleware
export const generateCsrfToken = (req, res, next) => {
    csrfProtection(req, res, () => {
        const token = req.csrfToken();
        // Set token in cookie and send in response
        res.cookie('XSRF-TOKEN', token, {
            HttpOnly: false, // Allow JavaScript access
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 2 * 60 * 60 * 1000
        });
        res.json({ csrfToken: token });
    });
};
 