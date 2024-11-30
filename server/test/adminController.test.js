import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import { 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    createLesson,
    updateLesson,
    deleteLesson,
    deleteUser,
    updateUser,
    unenrollUserFromCourse,
    getAllStats
} from '../controllers/adminController.js';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import Lesson from '../models/lessonModel.js';
import Certification from '../models/certificationModel.js';

vi.mock('../models/courseModel.js', () => ({
    default: {
        find: vi.fn().mockResolvedValue([]),
        findById: vi.fn(),  
        create: vi.fn(),
        deleteOne: vi.fn(),
        updateOne: vi.fn(),
        countDocuments: vi.fn()
    }
}));

vi.mock('../models/userModel.js', () => ({
    default: {
        findById: vi.fn(),
        deleteOne: vi.fn(),
        updateMany: vi.fn(),
        find: vi.fn(),
        countDocuments: vi.fn()
    }
}));

vi.mock('../models/lessonModel.js', () => ({
    default: {
        findById: vi.fn(),
        deleteMany: vi.fn(),
        find: vi.fn(),
        create: vi.fn(),
        deleteOne: vi.fn(),
        countDocuments: vi.fn()
    }
}));

vi.mock('../models/certificationModel.js', () => ({
    default: {
        findOne: vi.fn(),
        find: vi.fn(),
        deleteMany: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn()
    }
}));

const mockRequest = (body = {}, params = {}, user = null) => ({
    body,
    params,
    user
});

const mockResponse = () => {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };
    return res;
};

describe("Admin Controller", () => {
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

    describe("createCourse", () => {
        it("should create a new course", async () => {
            const req = mockRequest({ 
                title: "mockTitle", 
                description: "mockDescription", 
                category: "mockCategory", 
                price: 10 
            });
            const res = mockResponse();

            req.file = { path: "mockFilePath" };

            const course = { 
                _id: "courseId",
                title: "mockTitle", 
                description: "mockDescription", 
                category: "mockCategory", 
                price: 10, 
                thumbnail: "mockFilePath",
                lessons: ["lessonId"]
            };

            Course.create.mockResolvedValue(course);

            await createCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cursus créé avec succès", course: course });
        });
    });

    describe("updateCourse", () => {
        it("should update a course and the related certifications", async () => {
            const req = mockRequest({ 
                title: "mockNewTitle", 
                description: "mockNewDescription", 
                category: "mockNewCategory", 
                price: 12 
            }, { courseId: "courseId" });
            const res = mockResponse();

            const course = { 
                _id: "courseId",
                title: "mockTitle", 
                description: "mockDescription", 
                category: "mockCategory", 
                price: 10, 
                thumbnail: "mockFilePath",
                save: vi.fn()
            };
            Course.findById.mockResolvedValue(course);
            
            req.file = { path: "mockNewFilePath" };

            const certifications = [{ 
                _id: "certificationId", 
                title: "mockTitle", 
                course: "courseId",
                save: vi.fn()
            }];
            Certification.find.mockResolvedValue(certifications);

            await updateCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cursus mis à jour avec succès", course: course });
        });

        it("should return an error if the course is not found", async () => {
            const req = mockRequest({}, { courseId: "courseId" });
            const res = mockResponse();

            Course.findById.mockResolvedValue(null);

            await updateCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Cursus non trouvé" });
        });
    });

    describe("deleteCourse", () => {
        it("should delete a course and perform all cleanup operations", async () => {
            const req = mockRequest({}, { courseId: "courseId" });
            const res = mockResponse();

            // Mock the course with thumbnail
            const mockCourse = { 
                _id: "courseId", 
                title: "Test Course",
                thumbnail: "path/to/thumbnail"
            };
            Course.findById.mockResolvedValue(mockCourse);

            // Mock lessons associated with the course
            const mockLessons = [
                { _id: "lesson1", course: "courseId" },
                { _id: "lesson2", course: "courseId" }
            ];
            Lesson.find.mockResolvedValue(mockLessons);

            await deleteCourse(req, res);

            // Verify all operations were called
            expect(Course.findById).toHaveBeenCalledWith("courseId");
            expect(Lesson.find).toHaveBeenCalledWith({ course: "courseId" });
            expect(Lesson.deleteMany).toHaveBeenCalledWith({ course: "courseId" });
            expect(Course.deleteOne).toHaveBeenCalledWith({ _id: "courseId" });
            expect(Certification.deleteMany).toHaveBeenCalledWith({ course: "courseId", certified: false });
            expect(User.updateMany).toHaveBeenCalledWith(
                { enrollment: "courseId" },
                { $pull: { enrollment: "courseId" } }
            );
            expect(User.updateMany).toHaveBeenCalledWith(
                { purchasedLessons: { $in: ["lesson1", "lesson2"] } },
                { $pull: { purchasedLessons: { $in: ["lesson1", "lesson2"] } } }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ 
                success: true, 
                message: "Cursus supprimé avec succès" 
            });
        });

        it("should return 404 if course is not found", async () => {
            const req = mockRequest({}, { courseId: "nonexistentId" });
            const res = mockResponse();

            Course.findById.mockResolvedValue(null);

            await deleteCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ 
                success: false, 
                message: "Cursus non trouvé" 
            });
        });
    });

    describe("createLesson", () => {
        it("should create a new lesson and update the course and the enrolled users", async () => {
            const req = mockRequest({ 
                title: "mockTitle", 
                description: "mockDescription", 
                content: "mockContent", 
                price: 10 
            }, { courseId: "courseId" });
            const res = mockResponse();

            const course = { 
                _id: "courseId", 
                lessons: ["lessonId"],
                save: vi.fn()
            };
            Course.findById.mockResolvedValue(course);

            const lesson = { 
                _id: "lessonId2", 
                title: "mockTitle", 
                description: "mockDescription", 
                content: "mockContent", 
                price: 10, 
                course: course._id
            };
            Lesson.create.mockResolvedValue(lesson);

            const users = [{ 
                _id: "userId", 
                enrollment: [course._id], 
                purchasedLessons: ["lessonId"],
                save: vi.fn()
            }];
            User.find.mockResolvedValue(users);

            await createLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Leçon créée avec succès", lessons: course.lessons });
        });
    });

    describe("updateLesson", () => {
        it("should update a lesson and return the updated course's lessons", async () => {
            const req = mockRequest({ 
                title: "mockNewTitle", 
                description: "mockNewDescription", 
                content: "mockNewContent", 
                price: 12
            }, { lessonId: "lessonId" });
            const res = mockResponse();

            const lesson = { 
                _id: "lessonId", 
                title: "mockTitle", 
                description: "mockDescription", 
                content: "mockContent", 
                price: 10, 
                save: vi.fn()
            };
            Lesson.findById.mockResolvedValue(lesson);

            const course = { 
                _id: "courseId", 
                lessons: ["lessonId"],
                save: vi.fn()
            };
            Course.findById.mockResolvedValue(course);

            await updateLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Leçon mise à jour avec succès", lessons: course.lessons });
        });

        it("should return 404 if lesson is not found", async () => {
            const req = mockRequest({}, { lessonId: "nonexistentId" });
            const res = mockResponse();

            Lesson.findById.mockResolvedValue(null);

            await updateLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Leçon non trouvée" });
        });
    });

    describe("deleteLesson", () => {
        it("should delete a lesson and return the updated course's lessons", async () => {
            const req = mockRequest({}, { lessonId: "lessonId" });
            const res = mockResponse();

            const lesson = { 
                _id: "lessonId", 
                course: "courseId",
            };
            Lesson.findById.mockResolvedValue(lesson);

            const course = { 
                _id: "courseId", 
                lessons: ["lessonId"],
                save: vi.fn()
            };
            Course.findById.mockResolvedValue(course);

            await deleteLesson(req, res);

            
            expect(Lesson.deleteOne).toHaveBeenCalledWith({ _id: "lessonId" });
            expect(Course.updateOne).toHaveBeenCalledWith({ _id: "courseId" }, { $pull: { lessons: lesson._id } });
            expect(Certification.updateMany).toHaveBeenCalledWith({ course: "courseId" }, { $pull: { completedLessons: lesson._id } });
            expect(User.updateMany).toHaveBeenCalledWith({ purchasedLessons: lesson._id }, { $pull: { purchasedLessons: lesson._id } });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Leçon supprimée avec succès", lessons: course.lessons });
        });
    });

    describe("deleteUser", () => {
        it("should delete a user", async () => {
            const req = mockRequest({}, { userId: "userId" });
            const res = mockResponse();

            const user = { 
                _id: "userId",
            };
            User.findById.mockResolvedValue(user);

            await deleteUser(req, res);

            expect(User.deleteOne).toHaveBeenCalledWith({ _id: "userId" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Utilisateur supprimé avec succès" });
        });
    });

    describe("getAllStats", () => {
        it("should return all stats", async () => {
            const req = mockRequest();
            const res = mockResponse();

            Course.countDocuments.mockResolvedValue(10);
            Lesson.countDocuments.mockResolvedValue(20);
            User.countDocuments.mockResolvedValue(30);

            await getAllStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, stats: { totalCourses: 10, totalLessons: 20, totalUsers: 30 } });
        });
    });

    describe("updateUser", () => {
        it("should update a user and the related certification", async () => {
            const req = mockRequest({ 
                name: "mockNewName", 
                role: "mockNewRole", 
                course: "courseId" 
            }, { userId: "userId" });
            const res = mockResponse();

            const user = { 
                _id: "userId",
                name: "mockName",
                role: "mockRole",
                enrollment: [],
                purchasedLessons: [],
                save: vi.fn()
            };
            User.findById.mockResolvedValue(user);

            const courseObj = { 
                _id: "courseId",
                title: "mockTitle",
                lessons: ["lessonId"]
            };
            Course.findById.mockResolvedValue(courseObj);

            const certification = { 
                title: courseObj.title,
                course: courseObj._id,
                user: user._id,
                completedLessons: []
            };
            Certification.findOne.mockResolvedValue(null);
            

            await updateUser(req, res);

            
            expect(Certification.create).toHaveBeenCalledWith(certification);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Utilisateur mis à jour avec succès", user });   
        });
    });

    describe("unenrollUserFromCourse", () => {
        it("should unenroll a user from a course", async () => {
            const req = mockRequest({}, { userId: "userId", courseId: "courseId" });
            const res = mockResponse();

            const user = { 
                _id: "userId",
                enrollment: ["courseId"],
                purchasedLessons: ["lessonId"],
                save: vi.fn()
            };
            User.findById.mockResolvedValue(user);

            const course = { 
                _id: "courseId",
                lessons: ["lessonId"]
            };
            Course.findById.mockResolvedValue(course);

            const lessons = [{ _id: "lessonId" , course: course._id }];
            Lesson.find.mockResolvedValue(lessons);

            await unenrollUserFromCourse(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Utilisateur désinscrit du cursus avec succès" });
        });
    });
}); 

