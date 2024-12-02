import Course from "../models/courseModel.js";
import tryCatch from "../middlewares/tryCatch.js";
import Lesson from "../models/lessonModel.js";
import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import Certification from "../models/certificationModel.js";
import stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

export const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const getAllCourses = tryCatch(async (req, res) => {

    const courses = await Course.find();

    res.status(200).json({ success: true, courses });   
})  

export const getCourseById = tryCatch(async (req, res) => {
    
    const course = await Course.findById(req.params.courseId);

    if(!course) return res.status(404).json({ success: false, message: "Cursus non trouvé" });

    res.status(200).json({ success: true, course });    
})

export const getLessonsByCourseId = tryCatch(async (req, res) => {

    const course = await Course.findById(req.params.courseId);

    const user = await User.findById(req.user._id);

    if(!course) return res.status(404).json({ success: false, message: "Cursus non trouvé" });

    const lessons = await Lesson.find({ course: course._id });

    if(!lessons) return res.status(404).json({ success: false, message: "Il n'y a pas de leçons pour ce cursus" });

    if(user.role === "admin") return res.status(200).json({ success: true, lessons });

    if(user.enrollment.includes(course._id)) return res.status(200).json({ success: true, lessons });

    const purchasedLessons = [];

    for(let i = 0; i < lessons.length; i++){
        if(user.purchasedLessons.includes(lessons[i]._id)) {
            purchasedLessons.push(lessons[i]);
        };
    }
    
    if(purchasedLessons.length === 0) return res.status(404).json({ success: false, message: "Vous n'avez pas acheté de leçons pour ce cursus" });

    res.status(200).json({ success: true, purchasedLessons });
})

export const getLessonById = tryCatch(async (req, res) => {

    const lesson = await Lesson.findById(req.params.lessonId);
    const user = await User.findById(req.user._id);

    if(!lesson) return res.status(404).json({ success: false, message: "Leçon non trouvée" });

    if(user.role === "admin") return res.status(200).json({ success: true, lesson });   

    if(user.purchasedLessons.includes(lesson._id)) return res.status(200).json({ success: true, lesson });

    res.status(403).json({ success: false, message: "Vous n'avez pas acheté cette leçon" });
})

export const getLessonSellingDetails = tryCatch(async (req, res) => {

    const lesson = await Lesson.findById(req.params.lessonId);

    if(!lesson) return res.status(404).json({ success: false, message: "Leçon non trouvée" });

    const lessonDetails = {
        _id: lesson._id,
        title: lesson.title,
        order: lesson.order,
        price: lesson.price,
        description: lesson.description, 
    }

    res.status(200).json({ success: true, lessonDetails });
}) 

export const getUserCourses = tryCatch(async (req, res) => {

    const user = await User.findById(req.params.userId);

    const courses = await Course.find({ _id: { $in: user.enrollment } });

    let coursesWithLessons = [];

    if(courses.length === 0 && user.enrollment.length === 0) return res.status(404).json({ success: false, message: "Vous n'êtes inscrit à aucun cursus" });

    for(let i = 0; i < courses.length; i++) {
        const lessons = await Lesson.find({ course: courses[i]._id });
        coursesWithLessons.push({
            _id: courses[i]._id,
            title: courses[i].title,
            description: courses[i].description,
            lessons: lessons,
        });
    }    

    if(user.purchasedLessons.length > 0) {
        const purchasedLessons = await Lesson.find({ _id: { $in: user.purchasedLessons } });

        for(let i = 0; i < purchasedLessons.length; i++) {
            if(!courses.some(course => course._id.toString() === purchasedLessons[i].course.toString())) {
                const course = await Course.findById(purchasedLessons[i].course);

                const existingCourseIndex = coursesWithLessons.findIndex(c => 
                    c._id.toString() === course._id.toString()
                );

                if(existingCourseIndex === -1) {
                    coursesWithLessons.push({
                        _id: course._id,
                        title: course.title,
                        description: course.description,
                        lessons: [purchasedLessons[i]],
                    });
                } else {
                    coursesWithLessons[existingCourseIndex].lessons.push(purchasedLessons[i]);
                }   
            }
        }
    }

    res.status(200).json({ success: true, coursesWithLessons });   
})

export const purchaseCourse = tryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.courseId);

    if(!course) return res.status(404).json({ success: false, message: "Cursus non trouvé" });

    if(user.enrollment.includes(course._id)) return res.status(400).json({ success: false, message: "Vous êtes déjà inscrit à ce cursus" });

    let unitLessonPrice = course.price/course.lessons.length;
    let totalDiscount = 0;

    for(let i = 0; i < user.purchasedLessons.length; i++) {
        if(course.lessons.includes(user.purchasedLessons[i])) {
            totalDiscount += unitLessonPrice;
        }
    }

    const session = await stripeInstance.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "eur",
                product_data: {
                    name: course.title,
                },
                unit_amount: Math.round((course.price - totalDiscount) * 100),
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: `${process.env.BACKEND_URL}/api/course/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${course._id}&userId=${user._id}`,
        cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel?courseId=${course._id}`,
    });    

    res.status(200).json({ success: true, session });
})

export const coursePaymentSuccess = tryCatch(async (req, res) => {
    const session = await stripeInstance.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] });

    if(session.payment_status === 'paid') {
        const course = await Course.findById(req.query.courseId); 

        const user = await User.findById(req.query.userId); 

        const payment = await Payment.create({
            user: user._id,
            product: course._id,
            productName: course.title,
            productType: "Course",
            amount: session.amount_total / 100,
            payment_id: session.payment_intent.id,
        });


        if(user.enrollment.includes(course._id)) return res.status(400).json({ success: false, message: "Vous êtes déjà inscrit à ce cursus" });  

        user.enrollment.push(course._id);
        for(let i = 0; i < course.lessons.length; i++) {
            user.purchasedLessons.push(course.lessons[i]._id);
        }

        const courseCertification = await Certification.findOne({ course: course._id, user: user._id });
        
        if(!courseCertification) {
            const certification = await Certification.create({
                user: user._id,
                course: course._id,
                title: course.title,
                completedLessons: [],
            });
            user.certificates.push(certification._id);
        }
        await user.save();

        res.redirect(`${process.env.FRONTEND_URL}/course/${course._id}/success`);
    } else {
        res.redirect(`${process.env.FRONTEND_URL}/course/${req.query.courseId}/fail`);
    }
}) 

export const purchaseLesson = tryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);

    const lesson = await Lesson.findById(req.params.lessonId);

    if(!lesson) return res.status(404).json({ success: false, message: "Leçon non trouvée" });

    if(user.purchasedLessons.includes(lesson._id)) return res.status(400).json({ success: false, message: "Vous avez déjà acheté cette leçon" });

    const session = await stripeInstance.checkout.sessions.create({
        customer_email: user.email,
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "eur",
                product_data: {
                    name: lesson.title,
                },
                unit_amount: lesson.price * 100,
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: `${process.env.BACKEND_URL}/api/lesson/payment/success?session_id={CHECKOUT_SESSION_ID}&lessonId=${lesson._id}&userId=${user._id}`,
        cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel?courseId=${lesson.course}`,
    });

    res.status(200).json({ success: true, session });
})

export const lessonPaymentSuccess = tryCatch(async (req, res) => {
    const session = await stripeInstance.checkout.sessions.retrieve(req.query.session_id, { expand: ['payment_intent.payment_method'] });

    if(session.payment_status === 'paid') {
        const lesson = await Lesson.findById(req.query.lessonId);
        const user = await User.findById(req.query.userId);
        const course = await Course.findById(lesson.course);

        if(user.purchasedLessons.includes(lesson._id)) return res.status(400).json({ success: false, message: "Vous avez déjà acheté cette leçon" });

        const payment = await Payment.create({
            user: user._id,
            product: lesson._id,
            productName: lesson.title,
            productType: "Lesson",
            amount: session.amount_total / 100,
            payment_id: session.payment_intent.id,
        });

        const courseCertification = await Certification.findOne({ course: course._id, user: user._id });

        if(!courseCertification) {
            const certification = await Certification.create({
                user: user._id,
                course: course._id,
                title: course.title,
                completedLessons: [],
            });
            user.certificates.push(certification._id);
        }

        user.purchasedLessons.push(lesson._id);
        const updatedUser = await user.save();

        let purchasedCourseLessons = [];

        for(let i = 0; i < updatedUser.purchasedLessons.length; i++) {
            if(course.lessons.includes(updatedUser.purchasedLessons[i])) {
                purchasedCourseLessons.push(updatedUser.purchasedLessons[i]);
            }
        }

        if(course.lessons.length === purchasedCourseLessons.length){
            updatedUser.enrollment.push(course._id);
            await updatedUser.save();
        }
        

        res.redirect(`${process.env.FRONTEND_URL}/course/${course._id}/success`);
    } else {
        res.redirect(`${process.env.FRONTEND_URL}/course/${req.query.courseId}/fail`);
    }   

})

export const paymentCancel = tryCatch(async (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/course/${req.query.courseId}/cancel`);
})

 