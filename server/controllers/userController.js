/**
 * @fileoverview User Controller
 * Implements user-related business logic including authentication, profile management, and payment history
 * @requires ../models/userModel
 * @requires ../models/paymentModel
 * @requires jsonwebtoken
 * @requires bcrypt
 * @requires crypto
 */

import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../middlewares/sendMail.js";
import tryCatch from "../middlewares/tryCatch.js";
import bcrypt from "bcrypt";  
import crypto from "crypto";

/**
 * Register a new user
 * @async
 * @function register
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Promise<void>}
 */
export const register = tryCatch(async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if(user) return res.status(400).json({ success: false, message: "Un utilisateur avec cet email existe déjà" });



  user = {
    name: name,
    email: email,
    password: password,
  }

  const otp = crypto.randomInt(100000, 999999);

  const activationToken = jwt.sign({
    user,
    otp,
   }, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
   });

   const data = {
    name: name,
    otp: otp,
   };

   await sendMail(email, "Account Activation", data);

   res.status(200).json({ 
    success: true,
    message: "Nous vous avons envoyé un code dans votre email pour l'activation de votre compte",
    activationToken: activationToken,
   });
});

/**
 * Verify user email with OTP
 * @async
 * @function verifyUser
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.body.activationToken - JWT token containing user data
 * @param {string} req.body.otp - One-time password for verification
 * @returns {Promise<void>}
 */
export const verifyUser = tryCatch(async (req, res) => {
  const { activationToken, otp } = req.body;

  const verify = jwt.verify(activationToken, process.env.ACTIVATION_TOKEN_SECRET);
  let user;

  if(!verify) return res.status(400).json({ success: false, message: "Code expiré" });

  if (verify.otp !== otp) return res.status(400).json({success: false, message: "Code invalide"})

  if (verify.updatedUser) {
    user = await User.findByIdAndUpdate(verify.user._id, verify.updatedUser, { new: true });
  } else {

    user = await User.create(verify.user);
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  }); 

  res.status(200).json({ success: true, message: "Email vérifié avec succès", user: user, token: token });
 });

/**
 * User login
 * @async
 * @function login
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Promise<void>}
 */
export const login = tryCatch(async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email });   

  if(!user) return res.status(400).json({ success: false, message: "Utilisateur non trouvé" });

  const isMatch = await bcrypt.compare(password, user.password);  

  if(!isMatch) return res.status(400).json({ success: false, message: "Mot de passe invalide" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  }); 

  res.status(200).json({ success: true, message: "Connexion réussie", token: token, user: user });   
})

/**
 * Get current user profile
 * @async
 * @function myProfile
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export const myProfile = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({ success: true, user: user });

})

/**
 * Update user profile
 * @async
 * @function updateProfile
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Updated name
 * @param {string} req.body.email - Updated email
 * @returns {Promise<void>}
 */
export const updateProfile = tryCatch(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user.id);

  if (email === user.email) {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { name }, { new: true });
    return res.status(200).json({ success: true, message: "Profil mis à jour avec succès", user: updatedUser });
  } else {

    if (await User.exists({ email: email })) {
      return res.status(400).json({ success: false, message: "Un utilisateur avec cet email existe déjà" });
    }

    const updatedUser = {
      name: name,
      email: email,
    }
  
    const otp = crypto.randomInt(100000, 999999);
  
    const activationToken = jwt.sign({
      user,
      updatedUser,
      otp,
     }, process.env.ACTIVATION_TOKEN_SECRET, {
      expiresIn: "5m",
     });
  
     const data = {
      name: name,
      otp: otp, 
     };
  
     await sendMail(email, "Account Activation", data);
  
     res.status(200).json({ 
      success: true,
      message: "Nous vous avons envoyé un code dans votre email pour l'activation de votre compte",
      activationToken: activationToken,
     });
    
  }
})

/**
 * Change user password
 * @async
 * @function changePassword
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Object} req.body - Request body
 * @param {string} req.body.password - New password
 * @returns {Promise<void>}
 */
export const changePassword = tryCatch(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(password, user.password);

  if(isMatch) return res.status(400).json({ success: false, message: "Le nouveau mot de passe ne peut pas être le même que l'ancien" });

  user.password = password;
  await user.save();

  res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès" });
})

/**
 * Get user payment history
 * @async
 * @function getUserPayments
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {string} req.params.userId - User ID
 * @returns {Promise<void>}
 */
export const getUserPayments = tryCatch(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if(!user) return res.status(400).json({ success: false, message: "Utilisateur non trouvé" });
  
  const payments = await Payment.find({ user: user._id });
  res.status(200).json({ success: true, payments: payments });
})

/**
 * Get all users (admin only)
 * @async
 * @function getAllUsers
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllUsers = tryCatch(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ success: true, users: users });
})

