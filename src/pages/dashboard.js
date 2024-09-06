import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { getDashboardData } from '../backend/dashboard';
import { calculateOverallWellbeingScore } from '../backend/scoreCalculation';
import { getSleepLogs } from '../backend/sleep';
import Navbar2 from './navbar2';
import { Link } from 'react-router-dom';
import '../css/dashboard.css';

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

const formatMinutes = (minutes) => {
  if (!minutes) return 'No data';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}; 

const calculateSleepStatistics = (sleepLogs) => {
  if (!sleepLogs || sleepLogs.length === 0) {
    return {
      avgDuration: 'N/A',
      avgQuality: 'N/A',
    };
  }

  let totalDuration = 0;
  let totalQuality = 0;
  let totalBedtimeMinutes = 0;
  let totalWaketimeMinutes = 0;

  sleepLogs.forEach(log => {
    const bedtime = new Date(log.bedtime);
    const waketime = new Date(log.waketime);
    
    // Calculate duration considering midnight crossover
    let duration = (waketime - bedtime) / (1000 * 60 * 60); // in hours
    if (duration < 0) {
      duration += 24; // Add 24 hours if waketime is on the next day
    }

    totalDuration += duration;
    totalQuality += log.quality;

    totalBedtimeMinutes += bedtime.getHours() * 60 + bedtime.getMinutes();
    totalWaketimeMinutes += waketime.getHours() * 60 + waketime.getMinutes();
  });

  const avgDuration = (totalDuration / sleepLogs.length).toFixed(2);
  const avgQuality = (totalQuality / sleepLogs.length).toFixed(1);
  const avgBedtimeMinutes = Math.round(totalBedtimeMinutes / sleepLogs.length);
  const avgWaketimeMinutes = Math.round(totalWaketimeMinutes / sleepLogs.length);

  const avgBedtime = new Date(0, 0, 0, Math.floor(avgBedtimeMinutes / 60), avgBedtimeMinutes % 60);
  const avgWaketime = new Date(0, 0, 0, Math.floor(avgWaketimeMinutes / 60), avgWaketimeMinutes % 60);

  return { avgDuration, avgQuality, avgBedtime, avgWaketime };
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [sleepStats, setSleepStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const [rawData, sleepLogs] = await Promise.all([
            getDashboardData(user.uid),
            getSleepLogs(user.uid)
          ]);

          if (rawData && typeof rawData === 'object') {
            const wellbeingScore = calculateOverallWellbeingScore(rawData.componentScores);
            const dashboardScore = {
              ...rawData,
              wellbeingScore: Math.round(wellbeingScore)
            };
            setDashboardData(dashboardScore);
          } else {
            throw new Error('Invalid data structure received from getDashboardData');
          }

          const calculatedSleepStats = calculateSleepStatistics(sleepLogs);
          setSleepStats(calculatedSleepStats);
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
          setError("Failed to fetch dashboard data. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Please log in to view your dashboard.");
      }
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!dashboardData || !sleepStats) {
    return <div>No dashboard data available</div>;
  }


  return (
    <>
      <Navbar2 />
      <div className="dashboard-container">
        <div className="dashboard">
          <header className="dashboard-header">
            <h1>Welcome to Your Wellbeing Dashboard!</h1>
          </header>
          
          <div className="overall-wellbeing-score-container">
            <div className="overall-wellbeing-score">
              <h2>Overall Wellbeing Score: {dashboardData.wellbeingScore}%</h2>
              <p>This score is based on your overall engagement with sleep tracking, fitness activities, mood logging, and meditation sessions.</p>
              <Link to="/wellbeing" className="improve-button">
                How to Improve Your Score
              </Link>
            </div>
          </div>
          
          <main className="dashboard-content">
            <Card title="Sleep" emoji="💤" link="/sleeptracker">
              <p><strong>Average Sleep Duration:</strong> {sleepStats.avgDuration} hours</p>
              <p><strong>Average Sleep Quality:</strong> {sleepStats.avgQuality}/10</p>
            </Card>
            
            <Card title="Fitness" emoji="🏃‍♂️" link="/fitness">
              <p>Total calories burned: {dashboardData.fitness?.totalCaloriesBurned?.toLocaleString() || 'No data'}</p>
              <p>Total exercise duration: {dashboardData.fitness?.totalExerciseDuration?.formatted || 'No data'}</p>
            </Card>
            
            <Card title="Mood Diary" emoji="✏️" link="/moodtracker">
              <p>Total entries: {dashboardData.mood?.totalEntries || 'No data'}</p>
              <p>Latest mood: {dashboardData.mood?.latestMood || 'Not logged yet'}</p>
            </Card>
            
            <Card title="Healthy Habits" emoji="🥳" link="/healthyhabits">
              <p>Remember to stay hydrated</p>
              <p>Have you had your 5 a day?</p>
            </Card>
            
            <Card title="Mindfulness" emoji="🧘" link="/mindfulness">
              <p>Meditations completed: {dashboardData.meditation?.completedSessions || 'No data'}</p>
              <p>Total mindful minutes: {formatMinutes(dashboardData.meditation?.totalMinutes)}</p>
            </Card>
            
            <Card title="Goals" emoji="🎯" link="/goals">
              <p>Current goal: {dashboardData.goals?.title || 'No active goal'}</p>
              <p>Target date: {dashboardData.goals?.targetDate ? new Date(dashboardData.goals.targetDate).toLocaleDateString() : 'N/A'}</p>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;