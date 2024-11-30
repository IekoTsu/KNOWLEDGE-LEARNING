import React, { useEffect, useState } from 'react'
import "./AccountDetails.css"
import { UserData } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom';
import { courseData } from '../../context/CourseContext';
import { FaArrowLeft } from 'react-icons/fa';
const AccountDetails = () => {
    const navigate = useNavigate();
    const {user, updateProfile, fetchUserPayments, payments} = UserData();
    const {fetchCourse, course} = courseData();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    async function handleSubmit(e) {
        e.preventDefault();

        await updateProfile(name, email, navigate);
    }

    useEffect(() => {
        async function fetchpayments() {
            await fetchUserPayments(user._id);
        }
        fetchpayments();
    }, [user._id]);

  return (
    <main className='account-details-main background-pattern'>
        <section className='account-details-section'>
            <div className='account-details-header'>
                <h1>votre compte</h1>
                <button className='back-button' onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
            </div>
            <div className='account-details-container'> 
                <form className='account-details-form' onSubmit={handleSubmit} >
                    <div className='account-details-form-group'>
                        <label htmlFor='email'>Email</label>
                        <input type='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className='account-details-form-group'>
                        <label htmlFor='name'>Nom d'utilisateur</label>
                        <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <button type='submit' className='common-button'>Mettre à jour</button>
                    <a href='/change-password'>Changer le mot de passe</a>
                </form>
            </div>
        </section>

        <section className='account-payment-section'>
            <div className="accordion accordion-flush" id="accordionFlushExample">
                <div className="accordion-item">
                    <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#payments" aria-expanded="false" aria-controls="payments">
                            <h2>Vos paiements</h2>
                        </button>
                    </h2>
                    <div id="payments" className="accordion-collapse collapse" data-bs-parent="#accordionFlushExample">
                        
                        {payments.length > 0 ? (
                            <div className="accordion-body">
                                {payments.map((payment) => (
                                    <div className='payment-item' key={payment._id}>
                                        <h3>{payment.productType} : {payment.productName}</h3>
                                        <p> Prix : {payment.amount} €</p>
                                        <p> Date : {new Date(payment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="accordion-body">
                                <h2>Vous n'avez pas de paiements</h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>  
    </main>
  )
}

export default AccountDetails
