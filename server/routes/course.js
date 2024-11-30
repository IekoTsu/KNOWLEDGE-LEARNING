import express from "express";
import { 
    getAllCourses, 
    getCourseById, 
    getLessonsByCourseId, 
    getLessonById, 
    getUserCourses, 
    purchaseCourse, 
    coursePaymentSuccess,
    paymentCancel,
    getLessonSellingDetails,
    purchaseLesson,
    lessonPaymentSuccess,
} from "../controllers/courseController.js";

import { isAuthenticated, isAuthorized } from "../middlewares/private.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";

const router = express.Router();

router.get("/courses", getAllCourses);
router.get("/course/:courseId", getCourseById);  
router.get("/course/:courseId/lessons", isAuthenticated, getLessonsByCourseId);
router.get("/lesson/:lessonId", isAuthenticated, getLessonById);
router.get("/lesson/:lessonId/details", getLessonSellingDetails);
router.get("/my-courses/:userId", isAuthenticated, isAuthorized, getUserCourses);

router.post("/purchase/:courseId", isAuthenticated, csrfMiddleware, purchaseCourse);
router.get("/course/payment/success", coursePaymentSuccess);

router.post("/purchase/lesson/:lessonId", isAuthenticated, csrfMiddleware, purchaseLesson);
router.get("/lesson/payment/success", lessonPaymentSuccess);

router.get("/payment/cancel", paymentCancel);   

export default router;  