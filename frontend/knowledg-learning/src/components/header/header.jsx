/**
 * @fileoverview Header component provides the main navigation bar for the application
 */

import React from "react";
import logo from "../../assets/logo.png";
import "./header.css";
import { NavLink } from "react-router-dom";

/**
 * @component
 * @description Renders the application header with logo and navigation links.
 * Uses NavLink for active link styling and routing.
 * 
 * Navigation includes:
 * - Home (Accueil)
 * - Courses (Nos Cursus)
 * - Account (Mon Compte)
 * 
 * @example
 * return (
 *   <Header />
 * )
 * 
 * @returns {JSX.Element} Rendered header with navigation
 */
const Header = () => {
  return (
    <header>
      <div className="logo">
        <NavLink to="/">
          <img src={logo} alt="logo"/>
        </NavLink>
      </div>

      <div className="links">
        <NavLink 
          className={({ isActive }) => isActive ? 'link active-link' : 'link'} 
          to="/"
        >
          Accueil
        </NavLink> 
        <NavLink 
          className={({ isActive }) => isActive ? 'link active-link' : 'link'} 
          to="/courses"
        >
          Nos Cursus
        </NavLink>
        <NavLink 
          className={({ isActive }) => isActive ? 'link active-link' : 'link'} 
          to="/account"
        >
          Mon Compte
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
