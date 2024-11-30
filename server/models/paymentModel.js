import mongoose from "mongoose";

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },  
    product: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "productType",
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    productType: {
        type: String,
        enum: ["Course", "Lesson"],
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
})

const Payment = mongoose.model("Payment", schema);  

export default Payment;
