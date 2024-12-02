/**
 * @fileoverview File Upload Middleware Configuration
 * Configures multer for handling file uploads with type filtering and storage settings
 * @requires multer
 * @requires uuid
 */

import multer from "multer";
import { v4 as uuidv4 } from "uuid";

/**
 * Filter function to validate file types
 * @function fileFilter
 * @param {import('express').Request} req - Express request object
 * @param {Express.Multer.File} file - Uploaded file object
 * @param {function} cb - Callback function
 * @returns {void}
 */
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
    if(allowedFileTypes.includes(file.mimetype)){
        cb(null, true); 
    } else {
        cb(new Error("Invalid file type"), false);
    }
}

/**
 * Multer storage configuration
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
    /**
     * Sets the destination folder for uploaded files
     * @param {import('express').Request} req - Express request object
     * @param {Express.Multer.File} file - Uploaded file object
     * @param {function} cb - Callback function
     */
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    /**
     * Generates unique filename for uploaded files
     * @param {import('express').Request} req - Express request object
     * @param {Express.Multer.File} file - Uploaded file object
     * @param {function} cb - Callback function
     */
    filename: (req, file, cb) => {
        const id = uuidv4();
        const extName = file.originalname.split(".").pop();
        
        const filename = `${id}.${extName}`;
        cb(null, filename);
    },  
});

/**
 * Configured multer middleware instance
 * Handles single file uploads with the field name "file"
 * @type {multer.Multer}
 */
export const upload = multer({ storage, fileFilter }).single("file");  