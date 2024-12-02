/**
 * @fileoverview MongoDB Database Configuration
 * Implements the database connection setup using Mongoose
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * MongoDB client configuration options
 * @type {Object}
 * @property {string} dbName - Name of the database
 */
const clientOptions = {
  dbName : 'apinode'
}

/**
 * Establishes connection to MongoDB database
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 */
export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, clientOptions);
    console.log("MongoDB connected");

  } catch (error) {
    console.log(error);
  }
};

