/**
 * @fileoverview Home page component serves as the landing page for Knowledge Learning
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/testimonials";

/**
 * @component
 * @description Landing page component that displays a welcome message and call-to-action
 * button to start learning. Also includes a testimonials section at the bottom.
 * 
 * Features:
 * - Welcome message in French
 * - CTA button to navigate to courses
 * - Testimonials section
 * 
 * @example
 * return (
 *   <Home />
 * )
 * 
 * @returns {JSX.Element} Rendered home page
 */
const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="home-page-container background-pattern"> 
      <section className="home-page">
        <div className="home-content">
          <h1>Bienvenue à Knowledge Learning</h1>
          <p>Apprendre, grandir et exceller</p>
          <button 
            className="common-button" 
            onClick={() => navigate("/courses")}
          >
            Commencer
          </button>
        </div>
      </section>
      <Testimonials />  
    </main>  
  );
};

export default Home;
