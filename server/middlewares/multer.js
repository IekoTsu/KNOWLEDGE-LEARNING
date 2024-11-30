import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
    if(allowedFileTypes.includes(file.mimetype)){
        cb(null, true); 
    } else {
        cb(new Error("Invalid file type"), false);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const id = uuidv4();
        const extName = file.originalname.split(".").pop();
        
        const filename = `${id}.${extName}`;
        cb(null, filename);
    },  
});

export const upload = multer({ storage, fileFilter }).single("file");  