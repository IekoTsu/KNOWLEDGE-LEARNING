import React from 'react'
import { UserData } from '../../context/UserContext'    
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import './ChangePassword.css';

const ChangePassword = () => {
    const {changePassword} = UserData(); 
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    async function handleSubmit(e) {
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

        await changePassword(password, navigate);
    }

  return (
    <main className='change-password-page background-pattern'>
        <section className='change-password-section'>
            <h1>Changer le mot de passe</h1>
            <form className='change-password-form' onSubmit={handleSubmit}>
                <div className='change-password-form-group'>
                    <label htmlFor='password'>Nouveau mot de passe</label>
                    <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} />

                    <label htmlFor='confirmPassword'>Confirmer le mot de passe</label>
                    <input type='password' id='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    
                    <button type='submit' className='common-button'>Mettre à jour</button>
                </div>
            </form>
        </section>
    </main>
  )
}

export default ChangePassword
