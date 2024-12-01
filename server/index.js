import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { generateCsrfToken, csrfMiddleware } from "./middlewares/csrfMiddleware.js";
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  credentials: true,
  allowedHeaders: ['Content-Type', 'csrf-token',  'token'],
  exposedHeaders: ['set-cookie']
}));

// Enable trust proxy if you're behind a reverse proxy (like on Render.com)
app.set('trust proxy', 1);

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads",express.static("uploads"));

// Add CSRF protection to all non-GET routes
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        next();
    } else {
        csrfMiddleware(req, res, next);
    }
});

// Add CSRF token endpoint
app.get('/api/csrf-token', generateCsrfToken);

// Add security headers
app.use(helmet());

// Add rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});


//importing routes
import courseRoutes from "./routes/course.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import certificationRoutes from "./routes/certification.js";

//using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api", certificationRoutes);

//server connection
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();

});