import React from "react";
import './app.css';
import Navbar from "./Navbar";
import man from "./images/man.jpg"
import Footer from "./footer";  // Corrected import

const App = () => {
    return (
        <div className="app-container">
            <Navbar />
            <div className="hero-image">
                <img src={man} alt="Man representing wellness journey" />
            </div>
            <div>
                <h2 className="hero-text"> 
                    Navigate your path to wellness and track your improvements
                </h2>
                <div className="button-container">
                    <button className="explore-button">Explore Now</button>
                </div>
            </div>
            <div className="grey-background-section">
                <div className="wellness-categories">
                    <div className="category">
                        <h3>Wellness Mindset</h3>
                        <p>Achieve a balanced and healthy lifestyle</p>
                    </div>
                    <div className="category">
                        <h3>Sleep Tracker</h3>
                        <p>Track the quality of sleep you are achieving daily</p>
                    </div>
                    <div className="category">
                        <h3>Well Being</h3>
                        <p>Find inner peace and improve your overall well-being</p>
                    </div>
                </div>
                <div className="why-mindjourney">
                    <h2>Why MindJourney?</h2>
                    <p>
                        Our platform allows you to take control of your well-being journey. 
                        Log daily experiences, track mood patterns, monitor sleep quality, 
                        and record fitness achievements - all in one place. Through data-driven 
                        insights, we help identify areas for growth and celebrate your progress.
                    </p>
                </div>
            </div>
            <Footer />  
        </div>
    );
};

export default App;