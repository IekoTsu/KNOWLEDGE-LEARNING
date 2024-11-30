import React, { useState } from 'react'
import "./Auth.css";
import { UserData } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const verify = () => {
  const navigate = useNavigate();
  const {verifyUser, btnLoading} = UserData();
  const [otp, setOtp] = useState("");
  const activationToken = localStorage.getItem("activationToken");

  const submitHandler = async(e) => {
    e.preventDefault();
    await verifyUser(activationToken, Number(otp), navigate);
  }

  return (
    <div className="auth-page">
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
    </div>
  );
};

export default verify
