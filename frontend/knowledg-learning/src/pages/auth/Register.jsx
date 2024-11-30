import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import toast, { Toaster } from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const {registerUser, btnLoading} = UserData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submitHandler = async(e) => {
    e.preventDefault();

    if(password !== confirmPassword) {
      toast.error("Le mot de passe et la confirmation du mot de passe ne correspondent pas");
      return;
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\.])[A-Za-z\d@$!%*?&\.]{6,}$/;
      if (!passwordRegex.test(password)) {
        toast.error("Le mot de passe doit contenir au moins 6 caractères, dont 1 lettre majuscule, 1 lettre minuscule, un chiffre et un caractère spécial", {
          duration: 10000,
          style: {
            maxWidth: '500px',
            padding: '16px',
            wordBreak: 'break-word'
          },
        });
        return;
      } 
    }

    await registerUser(name, email, password, navigate);
  }

  return (
    <main className="auth-page background-pattern">
      <div className="auth-form">
        <h2>S'inscrire</h2>
        <form onSubmit={submitHandler}>
            <label htmlFor="username">Nom</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />

            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />

            <label htmlFor="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />

            <label htmlFor="confirmPassword">Confirmation du mot de passe</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
            />

            <button disabled={btnLoading} type="submit" className="common-button">
              {btnLoading ? 
              <section className="dots-container">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </section> :
               "Register"}
            </button>   
        </form>
        <p>Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>
    </main>
  );
}

export default Register
