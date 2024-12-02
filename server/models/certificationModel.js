/**
 * @fileoverview Certification Model Schema Definition
 * Defines the structure for user course certifications with automatic completion tracking
 * @requires mongoose
 * @requires ./courseModel
 */

import mongoose from "mongoose";
import Course from "./courseModel.js";

/**
 * Certification Schema
 * @typedef {Object} CertificationSchema
 * @property {ObjectId} user - Reference to the user earning the certification
 * @property {string} title - Title of the certification (matches course title)
 * @property {ObjectId} course - Reference to the course being certified
 * @property {Array<ObjectId>} completedLessons - Array of completed lesson IDs
 * @property {boolean} certified - Whether all lessons are completed
 * @property {Date} createdAt - Timestamp of certification creation
 * @property {Date} updatedAt - Timestamp of last update
 */
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

/**
 * Compound Index
 * Ensures a user can only have one certification per course
 */
certificationSchema.index({ user: 1, course: 1 }, { unique: true });

/**
 * Pre-save middleware
 * Automatically updates certification status based on completed lessons
 * @function
 * @param {Function} next - Mongoose middleware next function
 */
certificationSchema.pre("save", async function(next) {
    if(this.isModified("completedLessons")) {
        const course = await Course.findById(this.course);
        this.certified = this.completedLessons.length === course.lessons.length;
    }
    next();
});

/**
 * Certification Model
 * @type {mongoose.Model}
 */
const Certification = mongoose.model("Certification", certificationSchema);

export default Certification;


