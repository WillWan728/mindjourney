import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from "./pages/footer";
import RegisterUser from "./pages/register";
import LoginUser from "./pages/login";
import SleepTracker from "./pages/sleeptracker";
import FitnessTracker from "./pages/fitnesstracker";
import AboutUs from "./pages/aboutus";
import MentalHealthPage from "./pages/mentalhealth";
import Journaling from "./pages/journaling";
import MoodTracker from "./pages/moodtracker";
import Homepage from "./pages/homepage.js"; 


const App = () => {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<Homepage />} /> 
                    <Route path="/register" element={<RegisterUser />} />
                    <Route path="/login" element={<LoginUser />} />
                    <Route path="/sleeptracker" element={<SleepTracker />} />
                    <Route path="/fitness" element={<FitnessTracker />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/mentalhealth" element={<MentalHealthPage />} />
                    <Route path="/journaling" element={<Journaling />} />
                    <Route path="/moodtracker" element={<MoodTracker />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
