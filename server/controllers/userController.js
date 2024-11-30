import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../middlewares/sendMail.js";
import tryCatch from "../middlewares/tryCatch.js";
import bcrypt from "bcrypt";  
import crypto from "crypto";

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

export const myProfile = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({ success: true, user: user });

})

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

export const changePassword = tryCatch(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(password, user.password);

  if(isMatch) return res.status(400).json({ success: false, message: "Le nouveau mot de passe ne peut pas être le même que l'ancien" });

  user.password = password;
  await user.save();

  res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès" });
})

export const getUserPayments = tryCatch(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if(!user) return res.status(400).json({ success: false, message: "Utilisateur non trouvé" });
  
  const payments = await Payment.find({ user: user._id });
  res.status(200).json({ success: true, payments: payments });
})

export const getAllUsers = tryCatch(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ success: true, users: users });
})

