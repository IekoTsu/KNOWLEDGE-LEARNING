import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/testimonials";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="home-page-container background-pattern"> 
      <section className="home-page">
        <div className="home-content">
          <h1>Bienvenue à Knowledge Learning</h1>
          <p>Apprendre, grandir et exceller</p>
          <button className="common-button" onClick={() => navigate("/courses")}>Commencer</button>
        </div>
      </section>
      <Testimonials />  
    </main>  
  );
};

export default Home;
