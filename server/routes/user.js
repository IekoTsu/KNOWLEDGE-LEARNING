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

import { isAuthenticated, isAuthorized, isAdmin } from "../middlewares/private.js";

const router = express.Router();

router.get("/users", isAuthenticated, isAdmin, getAllUsers);

router.post("/user/register", register); 

router.post("/user/verify", verifyUser);

router.post("/user/login", login);

router.get("/user/me", isAuthenticated, myProfile);

router.put("/user/update", isAuthenticated, updateProfile);

router.put("/user/change-password", isAuthenticated, changePassword);

router.get("/user/:userId/payments", isAuthenticated, isAuthorized, getUserPayments);
export default router;

