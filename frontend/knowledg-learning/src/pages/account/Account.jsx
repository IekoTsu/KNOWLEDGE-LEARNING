/**
 * @fileoverview Account page component for displaying user profile and logout functionality
 */

import React from 'react'
import { MdDashboard, MdLogout } from "react-icons/md";
import "./Account.css";
import { UserData } from '../../context/UserContext';
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { refreshCsrfToken } from '../../utils/csrf';

/**
 * @component
 * @description Displays the user's profile information and provides logout functionality.
 * Includes navigation to the dashboard and handles user authentication state.
 * 
 * Features:
 * - Displays user's name and email
 * - Logout button with CSRF token refresh
 * - Navigation to user dashboard
 * 
 * @example
 * return (
 *   <Account user={user} />
 * )
 * 
 * @param {Object} props
 * @param {Object} props.user - User object containing name and email
 * 
 * @returns {JSX.Element} Rendered account page
 */
const Account = ({user}) => {
  const {setIsAuth, setUser, setIsAdmin} = UserData();

  /**
   * Handles user logout process
   * @async
   * @function logoutHandler
   */
  const logoutHandler = async () => {
    setIsAuth(false);
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("token");
    await refreshCsrfToken();
    toast.success("Déconnexion effectuée avec succès");
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
