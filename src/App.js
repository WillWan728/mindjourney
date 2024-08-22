import React from "react";
import './css/app.css';
import Navbar from "./Navbar";
import AboutUs from "./aboutus";
import man from "./images/man.jpg";
import Footer from "./footer";
import RegisterUser from "./register";
import LoginUser from "./login";
import SleepTracker from "./sleeptracker";
import FitnessTracker from "./fitnesstracker";
import MentalHealthPage from "./mentalhealth"; 
import Journaling from "./journaling";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <Routes>
                    <Route path="/" element={
                        <div>
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
                        </div>
                    } />
                    <Route path="/register" element={<RegisterUser />} />
                    <Route path="/login" element={<LoginUser />} />
                    <Route path="/sleeptracker" element={<SleepTracker />} />
                    <Route path="/Fitness" element={<FitnessTracker />} />
                    <Route path="/about" element={<AboutUs />}/>
                    <Route path="/mentalhealth" element={<MentalHealthPage />} /> 
                    <Route path="/journaling" element={<Journaling />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
