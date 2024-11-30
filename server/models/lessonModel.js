import mongoose from "mongoose";

const schema = new mongoose.Schema({

    title:{
        type: String,
        required: true,
    },

    order:{
        type:Number,
        default: 1,
        required: true,
    },

    description:{
        type: String,
        required: true,
    },

    content:{
        type: String,
        required: true,
    },

    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },

    price:{
        type: Number,
        required: true,
    },


},
{
    timestamps: true,
}
)

// Add validation for maximum order
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

schema.pre('findOneAndDelete', async function(next) {
    const doc = this.getQuery(); // Get the query conditions
    const lessonToDelete = await this.model.findOne(doc);
    if (lessonToDelete) {
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

// Handle order changes
schema.pre('save', async function(next) {
    if (this.isNew) {
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

const Lesson = mongoose.model("Lesson", schema);

export default Lesson;

