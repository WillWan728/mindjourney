import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from "./pages/footer";
import RegisterUser from "./pages/register";
import LoginUser from "./pages/login";
import SleepTracker from "./pages/sleep/sleeptracker.js";
import FitnessTracker from "./pages/fitness/fitnesstracker.js";
import AboutUs from "./pages/about";
import HomeAboutUsPage from "./pages/homeaboutpage.js";
import MoodTracker from "./pages/Journaling/moodtracker.js";
import Homepage from "./pages/homepage.js"; 
import DashboardPage from "./pages/dashboard.js";
import MindfulExercisePage from "./pages/meditation/meditation.js";
import HealthyHabitsPage from "./pages/healthyhabit.js";
import ProfilePage from "./pages/profile.js";
import Wellbeing from "./pages/wellbeing.js";
import Goals from "./pages/goals.js";
import GoalSetupPage from "./pages/welbeingSetup.js";
import AchievementPage from "./pages/achievements.js";
import { AchievementProvider } from './utils/achievementUtils';

const App = () => {
    return (
        <AchievementProvider>
            <Router>
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/register" element={<RegisterUser />} />
                        <Route path="/login" element={<LoginUser />} />
                        <Route path="/sleeptracker" element={<SleepTracker />} />
                        <Route path="/fitness" element={<FitnessTracker />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/moodtracker" element={<MoodTracker />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/homeaboutpage" element={<HomeAboutUsPage />} />
                        <Route path="/mindfulness" element={<MindfulExercisePage />} />
                        <Route path="/healthyhabits" element={<HealthyHabitsPage />} />
                        <Route path="/profile" element={<ProfilePage/>}/>
                        <Route path="/wellbeing" element={<Wellbeing/>}/>
                        <Route path="/goals" element={<Goals/>}/>
                        <Route path="/wellbeingSetup" element={<GoalSetupPage/>}/>
                        <Route path="/achievements" element={<AchievementPage/>}/>
                    </Routes>
                    <Footer />
                </div>
            </Router>
        </AchievementProvider>
    );
};


export default App;