/**
 * @fileoverview Verify page component for email verification after registration
 */

import React, { useState } from 'react'
import "./Auth.css";
import { UserData } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

/**
 * @component
 * @description Renders the verification page where users enter their email verification code.
 * Uses the activation token stored in localStorage and handles the verification process.
 * Displays loading state during verification.
 * 
 * Features:
 * - OTP input field
 * - Submit button with loading state
 * - Verification status message
 * 
 * @example
 * return (
 *   <Verify />
 * )
 * 
 * @returns {JSX.Element} Rendered verification page
 */
const verify = () => {
  const navigate = useNavigate();
  const {verifyUser, btnLoading} = UserData();
  const [otp, setOtp] = useState("");
  const activationToken = localStorage.getItem("activationToken");

  /**
   * Handles form submission for email verification
   * @async
   * @function submitHandler
   * @param {Event} e - Form submission event
   */
  const submitHandler = async(e) => {
    e.preventDefault();
    await verifyUser(activationToken, Number(otp), navigate);
  }

  return (
    <main className="auth-page background-pattern">
      <div className="auth-form">
        <h1>Verify</h1>
        <p>Please check your email for the verification code.</p>
        <form onSubmit={submitHandler}>
            <input 
              type="number" 
              id="verificationCode" 
              name="verificationCode" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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
               "Verify"}
            </button> 
        </form>
      </div>
    </main>
  );
};

export default verify
