import mongoose from "mongoose";
import bcrypt from "bcrypt";


const schema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },

    email:{
        type: String,
        required: true,
        unique: true,
    },

    password:{
        type: String,
        required: true,
    },

    role:{
        type: String,
        default: "user"
    },

    enrollment:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",  
    }],

    purchasedLessons:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
    }],
    
    certificates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certification",
    }]
},{
    timestamps: true,
})

schema.pre('save', async function(next) {
    const user = this;

    // If the password field has not been modified, skip hashing
    if (!user.isModified('password')) {
        return next();
    }

    try {
        // Hash the password with a salt factor of 10
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        next();
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model("User", schema);

export default User;