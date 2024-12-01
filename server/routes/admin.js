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
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/create", isAuthenticated, isAdmin, upload, createCourse);      
router.put("/course/:courseId/update", isAuthenticated, isAdmin, upload, updateCourse);
router.delete("/course/:courseId/delete", isAuthenticated, isAdmin, deleteCourse);

router.post("/course/:courseId/lesson/create", isAuthenticated, isAdmin, createLesson);
router.put("/lesson/:lessonId/update", isAuthenticated, isAdmin, updateLesson);
router.delete("/lesson/:lessonId/delete", isAuthenticated, isAdmin, deleteLesson);


router.delete("/user/:userId/delete", isAuthenticated, isAdmin, deleteUser);
router.put("/user/:userId/update", isAuthenticated, isAdmin, updateUser);
router.delete("/user/:userId/unenroll/:courseId", isAuthenticated, isAdmin, unenrollUserFromCourse);

router.get("/stats", isAuthenticated, isAdmin, getAllStats);
export default router; 