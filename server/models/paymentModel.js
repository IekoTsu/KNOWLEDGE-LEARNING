/**
 * @fileoverview Payment Model Schema Definition
 * Defines the structure for payment records in MongoDB
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Payment Schema
 * @typedef {Object} PaymentSchema
 * @property {ObjectId} user - Reference to the user who made the payment
 * @property {ObjectId} product - Reference to the purchased product (Course or Lesson)
 * @property {string} productName - Name of the purchased product
 * @property {string} productType - Type of product ("Course" or "Lesson")
 * @property {number} amount - Payment amount
 * @property {string} payment_id - External payment service transaction ID
 * @property {Date} createdAt - Timestamp of payment creation
 * @property {Date} updatedAt - Timestamp of last update
 */
const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },  
    product: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "productType",  // Dynamic reference based on productType
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    productType: {
        type: String,
        enum: ["Course", "Lesson"],  // Restricts to either Course or Lesson
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },  
    payment_id: {
        type: String,
        required: true,
    },  
}, {
    timestamps: true,   
});

/**
 * Payment Model
 * @type {mongoose.Model}
 */
const Payment = mongoose.model("Payment", schema);  

export default Payment;
