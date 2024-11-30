import React from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserData } from "../../context/UserContext";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {loginUser, btnLoading} = UserData();

  const submitHandler = async(e) => {
    e.preventDefault();
    await loginUser(email, password, navigate);
  }

  return (
    <main className="auth-page background-pattern">
      <div className="auth-form">
        <h2>Se connecter</h2>
        <form onSubmit={submitHandler}>
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

            <button disabled={btnLoading} type="submit" className="common-button">
              {btnLoading ? 
              <section className="dots-container">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </section> :
               "Login"}
            </button>    
        </form>

        <p>Vous n'avez pas de compte ? <Link to="/register">S'inscrire</Link></p>
      </div>
    </main>
  );
};

export default Login;
