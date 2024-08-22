import React from 'react';
import './css/aboutus.css';
import team from './images/team.jpg';  

const AboutUs = () => {
    return (
        <div className="about-us-container">
            <h1>About MindJourney</h1>
            <img 
                src={team}  // Use the imported image variable here
                alt="Team collaborating on wellness project" 
                className="about-us-image"
            />
            <p>
                Welcome to MindJourney! We are dedicated to helping you achieve your wellness goals. 
                Our platform provides cutting-edge tools and actionable insights to track your progress 
                and maintain a healthy lifestyle. Whether it's monitoring your sleep, fitness, or overall 
                well-being, MindJourney is here to support your journey every step of the way.
            </p>
            <p className="mission-statement">
                Our mission is to empower individuals to take control of their mental and physical health 
                by offering an intuitive and personalized experience.
            </p>
            <p>
                With MindJourney, you can gain valuable insights into your daily habits, set achievable goals, 
                and celebrate your milestones. Our team of experts in psychology, fitness, and technology 
                work tirelessly to ensure that you have access to the most effective tools and strategies 
                for personal growth and wellness.
            </p>
        </div>
    );
};

export default AboutUs;
