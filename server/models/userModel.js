/**
 * @fileoverview User Model Schema Definition
 * Defines the structure and behavior of User documents in MongoDB
 * @requires mongoose
 * @requires bcrypt
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";

/**
 * User Schema
 * @typedef {Object} UserSchema
 * @property {string} name - User's full name
 * @property {string} email - User's email address (unique)
 * @property {string} password - Hashed password
 * @property {string} role - User role (default: "user")
 * @property {Array<ObjectId>} enrollment - Array of enrolled course IDs
 * @property {Array<ObjectId>} purchasedLessons - Array of purchased lesson IDs
 * @property {Array<ObjectId>} certificates - Array of earned certification IDs
 * @property {Date} createdAt - Timestamp of user creation
 * @property {Date} updatedAt - Timestamp of last update
 */
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user"
    },
    enrollment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",  
    }],
    purchasedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
    }],
    certificates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certification",
    }]
}, {
    timestamps: true,
});

/**
 * Password Hashing Middleware
 * Automatically hashes the password before saving if it has been modified
 * @function
 * @param {Function} next - Express middleware next function
 */
schema.pre('save', async function(next) {
    const user = this;

    // Skip hashing if password hasn't been modified
    if (!user.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * User Model
 * @type {mongoose.Model}
 */
const User = mongoose.model("User", schema);

export default User;