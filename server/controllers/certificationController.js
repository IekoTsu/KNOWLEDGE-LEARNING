import tryCatch from "../middlewares/tryCatch.js";
import Certification from "../models/certificationModel.js";
import Course from "../models/courseModel.js";
import { sendCertificationMail } from "../middlewares/sendMail.js";

export const getUserCertifications = tryCatch(async (req, res) => {
    const certifications = await Certification.find({ user: req.user._id });

    if(!certifications) {
        return res.status(404).json({ success: false, message: "Aucune certification trouvée pour cet utilisateur" });
    }

    res.status(200).json({ success: true, certifications });
});

export const getUserCertification = tryCatch(async (req, res) => {
    const courseId = req.params.courseId;
    const user = req.user;

    const certification = await Certification.findOne({ user: user._id, course: courseId });
    res.status(200).json({ success: true, certification });
});

export const validateLesson = tryCatch(async (req, res) => {
    const { lessonId } = req.params;
    const user = req.user;
    const course = await Course.findOne({ lessons: { $in: lessonId } });

    const certification = await Certification.findOne({ user: user._id, course: course._id });

    if(!certification) {
        return res.status(404).json({ success: false, message: "Certification non trouvée" });
    } else if(certification.completedLessons.includes(lessonId)) {
        return res.status(400).json({ success: false, message: "Leçon déjà validée" });
    }

    certification.completedLessons.push(lessonId);
    await certification.save();

    if(certification.completedLessons.length === course.lessons.length) {
        certification.certified = true;
        await certification.save();
    }

    if(certification.certified) {
        sendCertificationMail(req.user.email, "Félicitations sur votre certification!", {
            name: req.user.name,
            course: course.title,
            certificateId: certification._id,
        });
        return res.status(200).json({ success: true, message: "Félicitations! Vous avez terminé le cursus.", certification });
    }

    res.status(200).json({ success: true, message: "Leçon validée", certification });
});
