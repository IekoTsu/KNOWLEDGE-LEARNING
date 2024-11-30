import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from 'vitest';
import { 
    getUserCertifications, 
    getUserCertification, 
    validateLesson 
} from "../controllers/certificationController.js";
import Certification from "../models/certificationModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

// Mock all required modules
vi.mock("../models/certificationModel.js", () => ({
    default: {
        find: vi.fn().mockResolvedValue([]),
        findOne: vi.fn()
    }
}));

vi.mock("../models/courseModel.js", () => ({
    default: {
        findOne: vi.fn()
    }
}));

vi.mock("../models/userModel.js", () => ({
    default: {
        findById: vi.fn().mockResolvedValue(null)
    }
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
    return res;
};  

describe("Certification Controller", () => {
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

    describe("getUserCertifications", () => {
        it("should return all certifications for a user", async () => {
            const req = mockRequest({}, {}, { _id: "mockUserId" });
            const res = mockResponse();

            const mockCertifications = [{ _id: "mockCertificationId", user: "mockUserId", course: "mockCourseId" }];
            Certification.find.mockResolvedValue(mockCertifications);
            await getUserCertifications(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, certifications: mockCertifications });
        });

        it("should return 404 if no certifications are found", async () => {
            const req = mockRequest({}, {}, { _id: "mockUserId" });
            const res = mockResponse();

            Certification.find.mockResolvedValue(null);
            await getUserCertifications(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Aucune certification trouvée pour cet utilisateur" });
        });
    }); 

    describe("getUserCertification", () => {
        it("should return a certification for a user", async () => {
            const req = mockRequest({}, { courseId: "mockCourseId" }, { _id: "mockUserId" });
            const res = mockResponse();

            const mockCertification = { _id: "mockCertificationId", user: "mockUserId", course: "mockCourseId" };
            Certification.findOne.mockResolvedValue(mockCertification);
            await getUserCertification(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, certification: mockCertification });
        });
    });

    describe("validateLesson", () => {
        it("should validate a lesson for a user as completed in the certification", async () => {
            const req = mockRequest({}, { lessonId: "mockLessonId" }, { user: { _id: "mockUserId" } });
            const res = mockResponse();

            const mockCourse = { _id: "mockCourseId", lessons: ["mockLessonId", "mockLessonId2"] };
            Course.findOne.mockResolvedValue(mockCourse);

            const mockCertification = { 
                _id: "mockCertificationId", 
                user: "mockUserId", 
                course: "mockCourseId", 
                completedLessons: [],
                certified: false,
                save : vi.fn()
            };

            Certification.findOne.mockResolvedValue(mockCertification);

            await validateLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Leçon validée", certification: mockCertification });
        });
        
        it("should return 400 if the lesson is already completed", async () => {
            const req = mockRequest({}, { lessonId: "mockLessonId" }, { user: { _id: "mockUserId" } });
            const res = mockResponse();

            const mockCertification = { 
                _id: "mockCertificationId", 
                user: "mockUserId", 
                course: "mockCourseId", 
                completedLessons: ["mockLessonId"],
                certified: false,
            };
            Certification.findOne.mockResolvedValue(mockCertification);

            await validateLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Leçon déjà validée" });
        });

        it("should return 404 if the certification is not found", async () => {
            const req = mockRequest({}, { lessonId: "mockLessonId" }, { user: { _id: "mockUserId" } });
            const res = mockResponse();

            Certification.findOne.mockResolvedValue(null);
            await validateLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: "Certification non trouvée" });
        });

        it("should return 200 and send a certification mail if the user validated all the lessons of the course", async () => {
            const req = mockRequest({}, { lessonId: "mockLessonId2" }, { user: { _id: "mockUserId" } });
            const res = mockResponse();

            const mockCourse = { _id: "mockCourseId", lessons: ["mockLessonId", "mockLessonId2"] };
            Course.findOne.mockResolvedValue(mockCourse);   

            const mockUser = { email: "mockUserEmail", name: "mockUserName" };
            User.findById.mockResolvedValue(mockUser);

            const mockCertification = { 
                _id: "mockCertificationId", 
                user: "mockUserId", 
                course: "mockCourseId", 
                completedLessons: ["mockLessonId"],
                certified: true,
                save : vi.fn()
            };

            Certification.findOne.mockResolvedValue(mockCertification);

            await validateLesson(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, message: "Félicitations! Vous avez terminé le cursus.", certification: mockCertification });
        });
    });
});

