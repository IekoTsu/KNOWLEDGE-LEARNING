import React from 'react'
import { MdDashboard, MdLogout } from "react-icons/md";
import "./Account.css";
import { UserData } from '../../context/UserContext';
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { refreshCsrfToken } from '../../utils/csrf';

const Account = ({user}) => {
  const {setIsAuth, setUser, setIsAdmin} = UserData();

  const logoutHandler = async () => {
    setIsAuth(false);
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("token");
    await refreshCsrfToken();
    toast.success("Déconnexion effectuée avec succès");
    console.log(isAdmin);
  }
  return (
    <main className='profile-page-main background-pattern'>
        <div className='profile-page'>
            <h2>Mon profil</h2>    
            <div className='profile-container'>
                <p>
                Nom:<strong> {user.name}</strong> 
                </p>
                <p>
                    Email:<strong> {user.email}</strong>  
                </p>

                <Link to="/dashboard" className="common-button"> <MdDashboard /> <span>Tableau de bord</span></Link>

                <button onClick={logoutHandler} className="common-button"> <MdLogout /> <span>Déconnexion</span></button>
            </div>
        </div>
    </main>
  )
}

export default Account
