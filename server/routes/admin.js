import express from "express";
import { 
    createCourse, 
    createLesson, 
    deleteLesson, 
    deleteCourse, 
    getAllStats, 
    deleteUser, 
    updateUser,
    unenrollUserFromCourse,
    updateCourse,
    updateLesson
} from "../controllers/adminController.js";
import { isAuthenticated, isAdmin } from "../middlewares/private.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/create", isAuthenticated, isAdmin, csrfMiddleware, upload, createCourse);      
router.put("/course/:courseId/update", isAuthenticated, isAdmin, csrfMiddleware, upload, updateCourse);
router.delete("/course/:courseId/delete", isAuthenticated, isAdmin, csrfMiddleware, deleteCourse);

router.post("/course/:courseId/lesson/create", isAuthenticated, isAdmin, csrfMiddleware, createLesson);
router.put("/lesson/:lessonId/update", isAuthenticated, isAdmin, csrfMiddleware, updateLesson);
router.delete("/lesson/:lessonId/delete", isAuthenticated, isAdmin, csrfMiddleware, deleteLesson);


router.delete("/user/:userId/delete", isAuthenticated, isAdmin, csrfMiddleware, deleteUser);
router.put("/user/:userId/update", isAuthenticated, isAdmin, csrfMiddleware, updateUser);
router.delete("/user/:userId/unenroll/:courseId", isAuthenticated, isAdmin, csrfMiddleware, unenrollUserFromCourse);

router.get("/stats", isAuthenticated, isAdmin, getAllStats);
export default router; 