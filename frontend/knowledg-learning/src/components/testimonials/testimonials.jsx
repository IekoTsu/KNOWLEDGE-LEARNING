/**
 * @fileoverview Testimonials component displays student feedback and reviews
 */

import React from "react";
import "./testimonials.css";

/**
 * @typedef {Object} TestimonialData
 * @property {number} id - Unique identifier for the testimonial
 * @property {string} name - Student's name
 * @property {string} position - Student's position/role
 * @property {string} message - Student's testimonial message
 * @property {string} image - URL to student's profile image
 */

/**
 * @component
 * @description Displays a section of student testimonials with their photos, names,
 * positions, and feedback messages. Currently shows static testimonial data in French.
 * 
 * @example
 * return (
 *   <Testimonials />
 * )
 * 
 * @returns {JSX.Element} Rendered testimonials section
 */
const Testimonials = () => {
    /** @type {TestimonialData[]} */
    const testimonialsData = [
        {
            id: 1,
            name: "John Doe",
            position: "Student",
            message: "Cette plateforme m'a aidé à apprendre de manière efficace. Les cours sont géniaux et les instructeurs sont de qualité supérieure.",
            image: "https://th.bing.com/th?q=Current+Bachelor&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.3&pid=InlineBlock&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
        },
        {
            id: 2,
            name: "Jane Smith",
            position: "Student",
            message: "Je me suis beaucoup amélioré ici qu'ailleurs. Les leçons interactives et les quiz rendent l'apprentissage amusant.",
            image: "https://th.bing.com/th/id/OIP.GKAiW3oc2TWXVEeZAzrWOAHaJF?w=135&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
        },
    ];

    return (
        <section className="testimonials-page">
            <h2>Ce que disent nos étudiants</h2>
            <div className="testimonials-container">
                {testimonialsData.map((testimonial) => (
                    <div className="testimonial-card" key={testimonial.id}>
                        <div className="student-image">
                            <img src={testimonial.image} alt={testimonial.name} />
                        </div>

                        <p className="message">{testimonial.message}</p>
                        
                        <div className="student-details">
                            <p className="student-name">{testimonial.name}</p>
                            <p className="student-position">{testimonial.position}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}; 

export default Testimonials;
