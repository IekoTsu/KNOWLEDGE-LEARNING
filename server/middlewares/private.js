import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if(!token) return res.status(403).json({ success: false, message: "Veuillez d'abord vous connecter" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if(!user) return res.status(403).json({ success: false, message: "Token is invalid" });

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ success: false, message: "Non autorisé" });
    }
}

export const isAdmin = async (req, res, next) => {
    try {
        if(req.user.role !== "admin") return res.status(403).json({ success: false, message: "Seuls les administrateurs sont autorisés à accéder à cette route" });
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}   


export const isAuthorized = async (req, res, next) => {
    try {
        if(req.user.id.toString() !== req.params.userId && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Vous n'êtes pas autorisé à accéder à cette route" });
        next();
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
