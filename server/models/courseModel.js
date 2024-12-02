/**
 * @fileoverview Course Model Schema Definition
 * Defines the structure for courses in MongoDB with lesson relationships
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Course Schema
 * @typedef {Object} CourseSchema
 * @property {string} title - Course title
 * @property {string} description - Course description
 * @property {string} category - Course category/subject area
 * @property {string} thumbnail - Path to course thumbnail image
 * @property {number} price - Course price
 * @property {Array<ObjectId>} lessons - Array of lesson IDs associated with this course
 * @property {Date} createdAt - Timestamp of course creation
 * @property {Date} updatedAt - Timestamp of last update
 */
const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
    }],
}, {
    timestamps: true,
});

/**
 * Course Model
 * @type {mongoose.Model}
 */
const Course = mongoose.model("Course", schema);

export default Course;