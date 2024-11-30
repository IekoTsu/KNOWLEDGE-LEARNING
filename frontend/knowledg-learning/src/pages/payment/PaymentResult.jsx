import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./PaymentResult.css"

const PaymentResult = () => {
    const navigate = useNavigate();
  return (
    <div className='payment-result-container'>
        Your payment is successful
        <button className='common-button' onClick={() => navigate("/courses")}>Continue to courses</button>
    </div>
  )
}

export default PaymentResult
