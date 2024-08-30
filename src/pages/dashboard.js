// src/pages/dashboard.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useLocation } from 'react-router-dom'; // Import useLocation
import '../css/dashboard.css';
import Navbar2 from './navbar2';

const Card = ({ title, emoji, link, children }) => (
  <Link to={link} className="card-link">
    <div className="card">
      <div className="card-header">
        <span className="emoji">{emoji}</span>
        <h3>{title}</h3>
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const location = useLocation();
  const username = location.state?.username || 'User';

  return (
    <div className="dashboard-container">
      <Navbar2 />
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Welcome to Your Wellbeing Dashboard, {username}!</h1>
        </header>
        
        <div className="weekly-wellbeing-score">
          <h2>Weekly Wellbeing Score: 75%</h2>
          <p>This score is calculated based on your sleep patterns, exercise routines, and stress levels throughout the week.</p>
          <button className="improve-button">How to Improve Your Score</button>
        </div>
        
        <main className="dashboard-content">
          <Card title="Sleep" emoji="💤" link="/sleeptracker">
            <p>Last night's sleep: 7h 30m</p>
            <p>Weekly average: 7h 15m</p>
          </Card>
          
          <Card title="Fitness" emoji="🏃‍♂️" link="/fitness">
            <p>Today's steps: 8,500</p>
            <p>Weekly exercise: 3h 30m</p>
          </Card>
          
          <Card title="Journalling" emoji="✏️" link="/journaling">
            <p>Entries this week: 5</p>
            <p>Streak: 7 days</p>
          </Card>
          
          <Card title="Mood Tracker" emoji="😊" link="/moodtracker">
            <p>Today's mood: Happy</p>
            <p>Weekly average: Positive</p>
          </Card>
          
          <Card title="Mindfulness" emoji="🧘" link="/mindfulness">
            <p>Meditations completed: 3</p>
            <p>Total mindful minutes: 45</p>
          </Card>
          
          <Card title="Wellbeing support links" emoji="👌" link="/wellbeinglink">
            <p>Resources available: 15</p>
            <p>New this week: 2</p>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
