/**
 * @fileoverview Login page component for user authentication
 */

import React from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserData } from "../../context/UserContext";

/**
 * @component
 * @description Renders the login page with a form for user authentication.
 * Includes fields for email and password, and a submit button that triggers
 * the login process. Displays a loading indicator while the login request is processing.
 * 
 * Features:
 * - Email and password input fields
 * - Submit button with loading state
 * - Link to registration page
 * 
 * @example
 * return (
 *   <Login />
 * )
 * 
 * @returns {JSX.Element} Rendered login page
 */
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {loginUser, btnLoading} = UserData();

  /**
   * Handles form submission for user login
   * @async
   * @function submitHandler
   * @param {Event} e - Form submission event
   */
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
