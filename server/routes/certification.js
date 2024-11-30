import express from "express";
import { getUserCertifications, getUserCertification, validateLesson } from "../controllers/certificationController.js";
import { isAuthenticated } from "../middlewares/private.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
const router = express.Router();

router.get("/certifications", isAuthenticated, getUserCertifications);
router.get("/certification/:courseId", isAuthenticated, getUserCertification);
router.post("/validate-lesson/:lessonId", isAuthenticated, csrfMiddleware, validateLesson);

export default router;
