import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },

    description:{
        type: String,
        required: true,
    },

    category:{
        type: String,
        required: true,
    },

    thumbnail:{
        type: String,
        required: true,
    },

    price:{
        type: Number,
        required: true,
    },

    lessons:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
    }],

},{
    timestamps: true,
})

const Course = mongoose.model("Course", schema);

export default Course;