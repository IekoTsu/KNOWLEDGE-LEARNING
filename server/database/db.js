import mongoose from "mongoose";

const clientOptions = {
  dbName : 'apinode'
}

export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    console.log("MongoDB connected");

  } catch (error) {
    console.log(error);
  }
};

