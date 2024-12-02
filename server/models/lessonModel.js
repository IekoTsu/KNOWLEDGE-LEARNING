/**
 * @fileoverview Lesson Model Schema Definition
 * Defines the structure for course lessons in MongoDB with automatic order management
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Lesson Schema
 * @typedef {Object} LessonSchema
 * @property {string} title - Lesson title
 * @property {number} order - Lesson order in the course (auto-managed)
 * @property {string} description - Lesson description
 * @property {string} content - Lesson content/material
 * @property {ObjectId} course - Reference to parent course
 * @property {number} price - Individual lesson price
 * @property {Date} createdAt - Timestamp of lesson creation
 * @property {Date} updatedAt - Timestamp of last update
 */
const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 1,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

/**
 * Pre-validate middleware
 * Validates that lesson order is within valid range
 * @function
 * @param {Function} next - Mongoose middleware next function
 * @throws {Error} If order exceeds total lessons or is less than 1
 */
schema.pre('validate', async function(next) {
    if (this.isModified('order')) {
        // Count total lessons in this course
        const totalLessons = await this.constructor.countDocuments({ course: this.course });
        
        if (this.order > totalLessons) {
            throw new Error(`Order cannot exceed total number of lessons (${totalLessons})`);
        }
        if (this.order < 1) {
            throw new Error('Order must be greater than 0');
        }
    }
    next();
});

/**
 * Pre-findOneAndDelete middleware
 * Adjusts order of remaining lessons when a lesson is deleted
 * @function
 * @param {Function} next - Mongoose middleware next function
 */
schema.pre('findOneAndDelete', async function(next) {
    const doc = this.getQuery();
    const lessonToDelete = await this.model.findOne(doc);
    if (lessonToDelete) {
        // Decrease order of all lessons after the deleted one
        const courseLessons = await this.model.find({ 
            course: lessonToDelete.course, 
            order: { $gt: lessonToDelete.order } 
        });
        
        for (const lesson of courseLessons) {
            lesson.order--;
            await lesson.save();
        }
    }
    next();
});

/**
 * Pre-save middleware
 * Manages lesson order on creation and updates
 * @function
 * @param {Function} next - Mongoose middleware next function
 */
schema.pre('save', async function(next) {
    if (this.isNew) {
        // Set order to last position for new lessons
        const lastLesson = await this.constructor.findOne({
            course: this.course
        }).sort('-order');
        
        this.order = lastLesson ? lastLesson.order + 1 : 1;
    } else if (this.isModified('order')) {
        const oldDoc = await this.constructor.findById(this._id);
        const oldOrder = oldDoc.order;
        const newOrder = this.order;
        
        // Update other lessons' orders
        if (oldOrder < newOrder) {
            await this.constructor.updateMany(
                { 
                    course: this.course,
                    order: { $gt: oldOrder, $lte: newOrder }
                },
                { $inc: { order: -1 } }
            );
        } else if (oldOrder > newOrder) {
            await this.constructor.updateMany(
                { 
                    course: this.course,
                    order: { $gte: newOrder, $lt: oldOrder }
                },
                { $inc: { order: 1 } }
            );
        }
    }
    next();
});

/**
 * Pre-deleteOne middleware
 * Updates lesson order after deletion
 * @function
 * @param {Function} next - Mongoose middleware next function
 */
schema.pre('deleteOne', { document: false, query: true }, async function(next) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
        const courseLessons = await this.model.find({ 
            course: doc.course, 
            order: { $gt: doc.order } 
        });
        
        for (const lesson of courseLessons) {
            lesson.order--;
            await lesson.save();
        }
    }
    next();
});

/**
 * Lesson Model
 * @type {mongoose.Model}
 */
const Lesson = mongoose.model("Lesson", schema);

export default Lesson;

