import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import { csrfMiddleware, generateCsrfToken } from '../middlewares/csrfMiddleware'
import { isAuthenticated, isAdmin, isAuthorized } from '../middlewares/private.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
// Setup test environment before any tests run
beforeAll(() => {
    process.env.JWT_SECRET = 'test_jwt_secret';
});

// Clean up after tests
afterAll(() => {
    delete process.env.JWT_SECRET;
});

// Define mockUserId and mockAdminId before using them
const mockUserId = new mongoose.Types.ObjectId();
const mockAdminId = new mongoose.Types.ObjectId();

// Mock User model with proper ID handling
vi.mock('../models/userModel.js', () => ({
    default: {
        findById: vi.fn((id) => {
            // Convert id to string for comparison
            const idStr = id.toString();
            if (idStr === mockUserId.toString()) {
                return Promise.resolve({ 
                    _id: mockUserId,
                    id: mockUserId,
                    role: 'user' 
                });
            } else if (idStr === mockAdminId.toString()) {
                return Promise.resolve({ 
                    _id: mockAdminId,
                    id: mockAdminId,
                    role: 'admin' 
                });
            }
            return Promise.resolve(null);
        })
    }
}));

describe('CSRF Middleware', () => {
    let app

    beforeEach(() => {
        app = express()
        app.use(cookieParser())
        
        // Test route that requires CSRF protection
        app.post('/protected', csrfMiddleware, (req, res) => {
            res.json({ success: true })
        })

        // Route to get CSRF token
        app.get('/get-csrf-token', generateCsrfToken)
    })

    it('should reject requests without CSRF token', async () => {
        const response = await request(app)
            .post('/protected')
            .expect(403)

        expect(response.body).toEqual({
            success: false,
            message: 'CSRF token validation failed'
        })
    })

    it('should accept requests with valid CSRF token', async () => {
        // First get the CSRF token
        const tokenResponse = await request(app)
            .get('/get-csrf-token')
            .expect(200)

        const csrfToken = tokenResponse.body.csrfToken
        const cookies = tokenResponse.headers['set-cookie']

        // Then make the protected request with the token
        const response = await request(app)
            .post('/protected')
            .set('csrf-token', csrfToken)
            .set('Cookie', cookies)
            .expect(200)

        expect(response.body).toEqual({
            success: true
        })
    })

    describe('generateCsrfToken', () => {
        it('should generate and return a CSRF token with correct cookie settings', async () => {
            const response = await request(app)
                .get('/get-csrf-token')
                .expect(200)

            // Check response body contains csrfToken
            expect(response.body).toHaveProperty('csrfToken')
            expect(typeof response.body.csrfToken).toBe('string')

            // Check cookie is set
            const cookies = response.headers['set-cookie']
            expect(cookies).toBeDefined()
            
            const csrfCookie = cookies.find(cookie => cookie.startsWith('_csrf='))
            expect(csrfCookie).toBeDefined()

            // Verify cookie settings
            expect(csrfCookie).toContain('Path=/')
            expect(csrfCookie).toContain('SameSite=None')
            
            // Check Secure setting based on NODE_ENV
            if (process.env.NODE_ENV === 'production') {
                expect(csrfCookie).toContain('Secure')
            }
        })
    })
})

describe('Authentication & Authorization Middlewares', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Test routes
        app.get('/protected', isAuthenticated, (req, res) => {
            res.json({ success: true });
        });

        app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
            res.json({ success: true });
        });

        app.get('/user/:userId', isAuthenticated, isAuthorized, (req, res) => {
            res.json({ success: true });
        });
    });

    describe('isAuthenticated', () => {
        it('should reject requests without token', async () => {
            const response = await request(app)
                .get('/protected')
                .expect(403);

            expect(response.body).toEqual({
                success: false,
                message: 'Veuillez d\'abord vous connecter'
            });
        });

        it('should reject requests with invalid token', async () => {
            const response = await request(app)
                .get('/protected')
                .set('token', 'invalid-token')
                .expect(401);

            expect(response.body).toEqual({
                success: false,
                message: 'Non autorisé'
            });
        });

        it('should accept requests with valid token', async () => {
            const token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);

            const response = await request(app)
                .get('/protected')
                .set('token', token)
                .expect(200);

            expect(response.body).toEqual({
                success: true
            });
        });
    });

    describe('isAdmin', () => {
        it('should reject non-admin users', async () => {
            const token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);

            const response = await request(app)
                .get('/admin')
                .set('token', token)
                .expect(403);

            expect(response.body).toEqual({
                success: false,
                message: 'Seuls les administrateurs sont autorisés à accéder à cette route'
            });
        });

        it('should accept admin users', async () => {
            const token = jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET);

            const response = await request(app)
                .get('/admin')
                .set('token', token)
                .expect(200);

            expect(response.body).toEqual({
                success: true
            });
        });
    });

    describe('isAuthorized', () => {
        it('should reject unauthorized users', async () => {
            const token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);

            const response = await request(app)
                .get(`/user/${mockAdminId}`)
                .set('token', token)
                .expect(403);

            expect(response.body).toEqual({
                success: false,
                message: 'Vous n\'êtes pas autorisé à accéder à cette route'
            });
        });

        it('should accept authorized users', async () => {
            const token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET);

            const response = await request(app)
                .get(`/user/${mockUserId}`)
                .set('token', token)
                .expect(200);

            expect(response.body).toEqual({
                success: true
            });
        });

        it('should accept admin users for any userId', async () => {
            const token = jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET);

            const response = await request(app)
                .get(`/user/${mockUserId}`)
                .set('token', token)
                .expect(200);

            expect(response.body).toEqual({
                success: true
            });
        });
    });
});