import mongoose from "mongoose";
import Course from "./courseModel.js";

const certificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
    }],
    certified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

certificationSchema.index({ user: 1, course: 1 }, { unique: true });

certificationSchema.pre("save", async function(next) {
    if(this.isModified("completedLessons")) {
        const course = await Course.findById(this.course);
        this.certified = this.completedLessons.length === course.lessons.length;
    }
    next();
});
    
const Certification = mongoose.model("Certification", certificationSchema);

export default Certification;


