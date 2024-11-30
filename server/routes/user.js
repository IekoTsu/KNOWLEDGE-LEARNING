import express from "express";
import { 
    register,
    verifyUser, 
    login, 
    myProfile, 
    updateProfile, 
    changePassword, 
    getUserPayments, 
    getAllUsers 
} from "../controllers/userController.js";

import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";
import { isAuthenticated, isAuthorized, isAdmin } from "../middlewares/private.js";

const router = express.Router();

router.get("/users", isAuthenticated, isAdmin, getAllUsers);

router.post("/user/register", csrfMiddleware, register); 

router.post("/user/verify", csrfMiddleware, verifyUser);

router.post("/user/login", login);

router.get("/user/me", isAuthenticated, myProfile);

router.put("/user/update", isAuthenticated, csrfMiddleware, updateProfile);

router.put("/user/change-password", isAuthenticated, csrfMiddleware, changePassword);

router.get("/user/:userId/payments", isAuthenticated, isAuthorized, getUserPayments);
export default router;

