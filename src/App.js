import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from "./pages/footer";
import RegisterUser from "./pages/register";
import LoginUser from "./pages/login";
import SleepTracker from "./pages/sleeptracker";
import FitnessTracker from "./pages/fitnesstracker";
import AboutUs from "./pages/about";
import HomeAboutUsPage from "./pages/homeaboutpage.js";
import MentalHealthPage from "./pages/mentalhealth";
import Journaling from "./pages/journaling";
import MoodTracker from "./pages/moodtracker";
import Homepage from "./pages/homepage.js"; 
import DashboardPage from "./pages/dashboard.js";
import MindfulExercisePage from "./pages/mindfull.js";
import HealthyHabitsPage from "./pages/healthyhabit.js";
import AchievementPage from "./pages/achievement.js";

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
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/homeaboutpage" element={<HomeAboutUsPage />} />
                        <Route path="/mindfulness" element={<MindfulExercisePage />} />
                        <Route path="/healthyhabits" element={<HealthyHabitsPage />} />
                        <Route path="/achievements" element={<AchievementPage />} />
                    </Routes>
                    <Footer />
                </div>
            </Router>
    );
};

export default App;