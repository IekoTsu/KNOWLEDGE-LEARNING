import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import {
    getAllCourses, 
    getCourseById, 
    getLessonsByCourseId,
    getLessonById,
    getLessonSellingDetails,
    getUserCourses,
    purchaseCourse,
    coursePaymentSuccess,
    purchaseLesson,
    lessonPaymentSuccess,
    paymentCancel,
    stripeInstance
} from '../controllers/courseController.js';
import Course from '../models/courseModel.js';
import Lesson from '../models/lessonModel.js';
import User from '../models/userModel.js';
import Payment from '../models/paymentModel.js';
import Certification from '../models/certificationModel.js';


// Mock all required modules
vi.mock('../models/courseModel.js', () => ({
    default: {
        findById: vi.fn(),
        find: vi.fn().mockResolvedValue([])
    }
}));

vi.mock('../models/lessonModel.js', () => ({ 
    default: {
        find: vi.fn().mockResolvedValue([]),
        findById: vi.fn()
    }
}));

vi.mock('../models/userModel.js', () => ({
    default: {
        findById: vi.fn().mockResolvedValue(null)
    }
}));

vi.mock('../models/paymentModel.js', () => ({
    default: { 
        find: vi.fn().mockResolvedValue([]),
        create: vi.fn()
    }
}));

vi.mock('../models/certificationModel.js', () => ({
    default: {
        find: vi.fn().mockResolvedValue([]),
        findOne: vi.fn(),
        create: vi.fn()
    }
}));

vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ id: 'mock_session_id' }),
        retrieve: vi.fn().mockResolvedValue({
          payment_status: 'paid',
          amount_total: 1000,
          payment_intent: {
            id: 'mock_payment_intent_id'
          }
        })
      }
    }
  }))
}));

const mockRequest = (body = {}, params = {}, user = null) => ({
    body,
    params,
    user
});
  
const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.redirect = vi.fn().mockReturnValue(res);
    return res;
};

describe('Course Controller', () => {
    beforeAll(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllCourses', () => {

        it('should return all courses', async () => {
            const req = mockRequest();
            const res = mockResponse();
            const mockCourses = [];

            Course.find.mockResolvedValueOnce(mockCourses);

            await getAllCourses(req, res);

            expect(Course.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                courses: mockCourses
            });
        });
    });

    describe('getCourseById', () => {
        it('should return a course', async () => {
            const req = mockRequest({}, { courseId: '123' });
            const res = mockResponse();

            const mockCourse = {};
            Course.findById.mockResolvedValueOnce(mockCourse);

            await getCourseById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                course: mockCourse
            });
        });

        it('should return a 404 error if course is not found', async () => {
            const req = mockRequest({}, { courseId: '123' });
            const res = mockResponse();

            Course.findById.mockResolvedValueOnce(null);

            await getCourseById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Cursus non trouvé'
            });
        });
    });

    describe('getLessonsByCourseId', () => {
        it('should return lessons for a course is user is enrolled or bought the lessons', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockCourse = {};
            Course.findById.mockResolvedValueOnce(mockCourse);

            const mockUser = { role: 'user', enrollment: [mockCourse._id], purchasedLessons: [{ _id: 'lessonId' }] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockLessons = [{ _id: 'lessonId' }];
            Lesson.find.mockResolvedValueOnce(mockLessons);

            await getLessonsByCourseId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                lessons: mockLessons
            });
        });

        it('should return the lessons if user is admin', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId'} });
            const res = mockResponse();

            const mockUser = { role: 'admin' };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourse = {};
            Course.findById.mockResolvedValueOnce(mockCourse);

            const mockLessons = [{ _id: 'lessonId' }];
            Lesson.find.mockResolvedValueOnce(mockLessons);

            await getLessonsByCourseId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true, lessons: mockLessons
            });
        });

        it('should return a 404 error if user is not enrolled or did not buy the lessons', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockUser = { role: 'user', enrollment: [], purchasedLessons: [] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourse = {};
            Course.findById.mockResolvedValueOnce(mockCourse);

            const mockLessons = [{ _id: 'lessonId' }];
            Lesson.find.mockResolvedValueOnce(mockLessons);

            await getLessonsByCourseId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Vous n\'avez pas acheté de leçons pour ce cursus'
            });
        });

        it('should return a 404 error if course is not found', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            Course.findById.mockResolvedValueOnce(null);

            await getLessonsByCourseId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Cursus non trouvé'
            });
        });

        it('should return a 404 error if there are no lessons for the course', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockUser = { role: 'user', enrollment: [], purchasedLessons: [] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourse = { _id: 'courseId' };
            Course.findById.mockResolvedValueOnce(mockCourse);  

            const mockLessons = null;
            Lesson.find.mockResolvedValueOnce(mockLessons); 

            await getLessonsByCourseId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Il n\'y a pas de leçons pour ce cursus'
            }); 
        });
    });

    describe('getLessonById', () => {
        it('should return a lesson if user is bought the lesson', async () => {
            const req = mockRequest({}, { lessonId: 'lessonId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockLesson = { _id: 'lessonId' };
            Lesson.findById.mockResolvedValueOnce(mockLesson);

            const mockUser = { role: 'user', purchasedLessons: ['lessonId'] };
            User.findById.mockResolvedValueOnce(mockUser);

            await getLessonById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true, lesson: mockLesson
            });
        });

        it('should return a 404 error if lesson is not found', async () => {
            const req = mockRequest({}, { lessonId: 'lessonId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            Lesson.findById.mockResolvedValueOnce(null);

            await getLessonById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Leçon non trouvée'
            });
        });

        it('should return a 403 error if user is not bought the lesson', async () => {
            const req = mockRequest({}, { lessonId: 'lessonId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockLesson = { _id: 'lessonId' };
            Lesson.findById.mockResolvedValueOnce(mockLesson);

            const mockUser = { role: 'user', purchasedLessons: [] };
            User.findById.mockResolvedValueOnce(mockUser);

            await getLessonById(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Vous n\'avez pas acheté cette leçon'
            });
        });

        it('should return a lesson if user is admin', async () => {
            const req = mockRequest({}, { lessonId: 'lessonId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockLesson = { _id: 'lessonId' };
            Lesson.findById.mockResolvedValueOnce(mockLesson);

            const mockUser = { role: 'admin' };
            User.findById.mockResolvedValueOnce(mockUser);

            await getLessonById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true, lesson: mockLesson
            });
        });
    });

    describe('getLessonSellingDetails', () => {
        it('should return the lesson details without including the paid content', async () => {
            const req = mockRequest({}, { lessonId: 'lessonId' });
            const res = mockResponse();

            const mockLesson = { _id: 'lessonId', title: 'lessonTitle', order: 1, price: 10, description: 'lessonDescription' };
            Lesson.findById.mockResolvedValueOnce(mockLesson);

            const mockLessonDetails = { 
                _id: mockLesson._id,
                title: mockLesson.title,
                order: mockLesson.order,
                price: mockLesson.price,
                description: mockLesson.description
            };

            await getLessonSellingDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true, lessonDetails: mockLessonDetails
            });
        });

        it('should return a 404 error if lesson is not found', async () => {
            const req = mockRequest({}, { lessonId: 'lessonId' });
            const res = mockResponse();

            Lesson.findById.mockResolvedValueOnce(null);

            await getLessonSellingDetails(req, res);        

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Leçon non trouvée'
            });
        });
    });
    
    describe('getUserCourses', () => {
        it('should return the user courses', async () => {
            const req = mockRequest({}, { userId: 'userId' });
            const res = mockResponse();

            const mockUser = { _id: 'userId', enrollment: ['courseId'], purchasedLessons: ['lessonId'] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourses = [{ _id: 'courseId', title: 'courseTitle', description: 'courseDescription', lessons: [] }];
            Course.find.mockResolvedValueOnce(mockCourses);

            const mockPurchasedLessons = [{ _id: 'lessonId', title: 'lessonTitle', order: 1, price: 10, description: 'lessonDescription', course: 'courseId' }];
            Lesson.find.mockResolvedValueOnce(mockPurchasedLessons);

            const mockCoursesWithLessons = [{ _id: 'courseId', title: 'courseTitle', description: 'courseDescription', lessons: mockPurchasedLessons }];

            await getUserCourses(req, res); 

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true, coursesWithLessons: mockCoursesWithLessons
            });
        });

        it('should return a 404 error if user is not enrolled in any courses and did not buy any lessons', async () => {
            const req = mockRequest({}, { userId: 'userId' });
            const res = mockResponse();

            const mockUser = { _id: 'userId', enrollment: [], purchasedLessons: [] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourses = [];
            Course.find.mockResolvedValueOnce(mockCourses);

            await getUserCourses(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Vous n\'êtes inscrit à aucun cursus'
            });
        });
    });

    describe('purchaseCourse', () => {
        it('should purchase a course and check if the user has already bought lessons from the course', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockUser = { _id: 'userId', enrollment: [], purchasedLessons: [{ _id: 'lessonId', course: 'courseId' }] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourse = { _id: 'courseId', title: 'courseTitle', description: 'courseDescription', lessons: [{ _id: 'lessonId' }, { _id: 'lessonId2' }] };
            Course.findById.mockResolvedValueOnce(mockCourse);

            const mockSession = { id: 'sessionId' };
            stripeInstance.checkout.sessions.create.mockResolvedValueOnce(mockSession);
            await purchaseCourse(req, res); 

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true, session: mockSession
            });
        });

        it('should return a 400 error if the user is already enrolled in the course', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockUser = { _id: 'userId', enrollment: ['courseId'] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourse = { _id: 'courseId', title: 'courseTitle', description: 'courseDescription', lessons: [] };
            Course.findById.mockResolvedValueOnce(mockCourse);

            await purchaseCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Vous êtes déjà inscrit à ce cursus'
            });
        });

        it('should return a 404 error if the course is not found', async () => {
            const req = mockRequest({}, { courseId: 'courseId' }, { user: { _id: 'userId' } });
            const res = mockResponse();
            const mockUser = { _id: 'userId', enrollment: [], purchasedLessons: [] };
            User.findById.mockResolvedValueOnce(mockUser);

            Course.findById.mockResolvedValueOnce(null);

            await purchaseCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false, message: 'Cursus non trouvé'
            });
        });
    });

    describe('coursePaymentSuccess', () => {
        it('should add course to enrollment, create payment and certification', async () => {
            // Mock process.env
            const originalEnv = process.env;
            process.env.FRONTEND_URL = 'http://localhost:3000';

            const req = mockRequest();
            // Add query parameters that match the controller expectations
            req.query = {
                session_id: 'session_id',
                courseId: 'courseId',
                userId: 'userId'
            };

            const res = mockResponse();

            const mockSession = { 
                id: 'sessionId', 
                payment_status: 'paid', 
                amount_total: 1000, 
                payment_intent: { id: 'paymentIntentId' } 
            };
            stripeInstance.checkout.sessions.retrieve.mockResolvedValueOnce(mockSession);

            const mockUser = { 
                _id: 'userId', 
                enrollment: [], 
                purchasedLessons: [], 
                certificates: [],
                save: vi.fn().mockResolvedValueOnce({ _id: 'userId' })  // Mock save method
            };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockCourse = { 
                _id: 'courseId', 
                title: 'courseTitle', 
                description: 'courseDescription', 
                lessons: [{ _id: 'lessonId' }] 
            };
            Course.findById.mockResolvedValueOnce(mockCourse);

            // Mock Payment.create
            Payment.create.mockResolvedValueOnce({
                _id: 'paymentId',
                user: 'userId',
                product: 'courseId'
            });

            // Mock Certification.findOne and create
            Certification.findOne.mockResolvedValueOnce(null);
            Certification.create.mockResolvedValueOnce({
                _id: 'certId',
                user: 'userId',
                course: 'courseId'
            });

            await coursePaymentSuccess(req, res);

            // Verify user enrollment was updated
            expect(mockUser.enrollment).toContain(mockCourse._id);
            expect(mockUser.save).toHaveBeenCalled();

            // Verify payment was created
            expect(Payment.create).toHaveBeenCalledWith({
                user: mockUser._id,
                product: mockCourse._id,
                productName: mockCourse.title,
                productType: "Course",
                amount: mockSession.amount_total / 100,
                payment_id: mockSession.payment_intent.id,
            });

            // Verify certification was created
            expect(Certification.create).toHaveBeenCalledWith({
                user: mockUser._id,
                course: mockCourse._id,
                title: mockCourse.title,
                completedLessons: [],
            });

            // Verify redirect
            expect(res.redirect).toHaveBeenCalledWith(`http://localhost:3000/course/courseId/success`);

            // Restore process.env
            process.env = originalEnv;
        });

        it('should redirect to fail page if payment fails', async () => {
            const originalEnv = process.env;
            process.env.FRONTEND_URL = 'http://localhost:3000';

            const req = mockRequest();
            req.query = {
                session_id: 'session_id',
                courseId: 'courseId',
                userId: 'userId'
            };
            const res = mockResponse();

            const mockSession = { payment_status: 'unpaid' };
            stripeInstance.checkout.sessions.retrieve.mockResolvedValueOnce(mockSession);

            await coursePaymentSuccess(req, res);

            expect(res.redirect).toHaveBeenCalledWith(`http://localhost:3000/course/courseId/fail`);

            // Restore process.env
            process.env = originalEnv;
        });
    });
    
    describe('purchaseLesson', () => {
        it('should purchase a lesson and check if the user has already bought the lesson', async () => {
            const req = mockRequest({}, { lessonId: 'lessonId' }, { user: { _id: 'userId' } });
            const res = mockResponse();

            const mockUser = { _id: 'userId', purchasedLessons: [] };
            User.findById.mockResolvedValueOnce(mockUser);

            const mockLesson = { _id: 'lessonId', title: 'lessonTitle', order: 1, price: 10, description: 'lessonDescription', course: 'courseId' };
            Lesson.findById.mockResolvedValueOnce(mockLesson);

            const mockSession = { id: 'sessionId' };
            stripeInstance.checkout.sessions.create.mockResolvedValueOnce(mockSession);

            await purchaseLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true, session: mockSession
            });
        });
    });

    describe('lessonPaymentSuccess', () => {
        it('should add lesson to purchasedLessons, create payment and certification', async () => {
            // Mock process.env
            const originalEnv = process.env;
            process.env.FRONTEND_URL = 'http://localhost:3000';

            const req = mockRequest();
            req.query = {
                session_id: 'session_id',
                lessonId: 'lessonId',
                userId: 'userId'
            };
            const res = mockResponse();

            // Mock stripe session
            const mockSession = { 
                payment_status: 'paid', 
                amount_total: 1000, 
                payment_intent: { id: 'paymentIntentId' } 
            };
            stripeInstance.checkout.sessions.retrieve.mockResolvedValueOnce(mockSession);

            const mockUser = { 
                _id: 'userId', 
                purchasedLessons: [], 
                certificates: [], 
                enrollment: [],
                save: vi.fn()
            };
            // First save adds the lesson and certificate
            mockUser.save.mockResolvedValueOnce({
                ...mockUser,
                purchasedLessons: ['lessonId'],
                certificates: ['certId']
            });
            // Second save adds the course enrollment
            mockUser.save.mockResolvedValueOnce({
                ...mockUser,
                purchasedLessons: ['lessonId'],
                certificates: ['certId'],
                enrollment: ['courseId']
            });
            User.findById.mockResolvedValueOnce(mockUser);

            // Mock lesson
            const mockLesson = { 
                _id: 'lessonId', 
                title: 'lessonTitle',
                course: 'courseId'
            };
            Lesson.findById.mockResolvedValueOnce(mockLesson);

            // Mock course - this was missing before
            const mockCourse = {
                _id: 'courseId',
                title: 'courseTitle',
                lessons: ['lessonId']  // Only one lesson for simplicity
            };
            Course.findById.mockResolvedValueOnce(mockCourse);

            const mockCertification = {
                _id: 'certId',
                user: 'userId',
                course: 'courseId'
            };
            Certification.create.mockResolvedValueOnce(mockCertification); 

            await lessonPaymentSuccess(req, res);

            // Verify payment was created
            expect(Payment.create).toHaveBeenCalledWith({
                user: 'userId',
                product: 'lessonId',
                productName: 'lessonTitle',
                productType: "Lesson",
                amount: 10,
                payment_id: 'paymentIntentId'
            });

            // Verify certification was created
            expect(Certification.create).toHaveBeenCalledWith({
                user: 'userId',
                course: 'courseId',
                title: 'courseTitle',
                completedLessons: []
            });

            // Verify redirect
            expect(res.redirect).toHaveBeenCalledWith(`http://localhost:3000/course/courseId/success`);

            // Restore process.env
            process.env = originalEnv;
        });

        it('should redirect to fail page if payment fails', async () => {
            const originalEnv = process.env;
            process.env.FRONTEND_URL = 'http://localhost:3000';

            const req = mockRequest();
            req.query = {
                session_id: 'session_id',
                courseId: 'courseId',
                userId: 'userId'
            };  

            const res = mockResponse();

            const mockSession = { payment_status: 'unpaid' };
            stripeInstance.checkout.sessions.retrieve.mockResolvedValueOnce(mockSession);

            await lessonPaymentSuccess(req, res);

            expect(res.redirect).toHaveBeenCalledWith(`http://localhost:3000/course/courseId/fail`);

            // Restore process.env
            process.env = originalEnv;
        });

    });

    describe('paymentCancel', () => {
        it('should redirect to cancel page', async () => {
            const originalEnv = process.env;
            process.env.FRONTEND_URL = 'http://localhost:3000';

            const req = mockRequest();
            req.query = {
                courseId: 'courseId'
            };
            const res = mockResponse();

            await paymentCancel(req, res);

            expect(res.redirect).toHaveBeenCalledWith(`http://localhost:3000/course/courseId/cancel`);
        });
    });
});