import React from "react";
import "./header.css";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <div className="logo">
        <NavLink to="/"><img src="/src/assets/logo.png" alt="logo"/></NavLink>
      </div>

      <div className="links">
        <NavLink 
          className={({ isActive }) => isActive ? 'link active-link' : 'link'} 
          to="/"
        >
          Home
        </NavLink> 
        <NavLink 
          className={({ isActive }) => isActive ? 'link active-link' : 'link'} 
          to="/courses"
        >
          Courses
        </NavLink>
        <NavLink 
          className={({ isActive }) => isActive ? 'link active-link' : 'link'} 
          to="/account"
        >
          Account
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
