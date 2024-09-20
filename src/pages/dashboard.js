import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import Navbar2 from './navbar2';
import { Link } from 'react-router-dom';
import '../css/dashboard.css';

const MemoizedCard = React.memo(({ title, emoji, link, children }) => (
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
));

const Dashboard = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback((userId) => {
    const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    const queries = [
      { collection: 'sleepLogs', emoji: '💤', link: '/sleeptracker' },
      { collection: 'exercises', emoji: '🏃‍♂️', link: '/fitness' },
      { collection: 'moodLogs', emoji: '✏️', link: '/moodtracker' },
      { collection: 'meditations', emoji: '🧘', link: '/mindfulness' },
      { collection: 'goals', emoji: '🎯', link: '/goals' },
    ];

    const unsubscribes = queries.map(({ collection: collectionName, emoji, link }) => {
      const collectionRef = collection(db, 'users', userId, collectionName);
      const q = query(collectionRef, where('date', '>=', oneWeekAgo));

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDashboardData(prevData => ({
          ...prevData,
          [collectionName]: { data, emoji, link }
        }));
        setLoading(false);
      }, (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(`Failed to load ${collectionName} data. Please try again later.`);
        setLoading(false);
      });
    });

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchDashboardData(user.uid);
      } else {
        setError("Please log in to view your dashboard.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchDashboardData]);

  const wellbeingScore = useMemo(() => {
    if (dashboardData) {
      // Calculate wellbeing score based on available data
      // This is a placeholder calculation
      return Math.round(Math.random() * 100);
    }
    return null;
  }, [dashboardData]);

  const dailyTips = useMemo(() => [
    "Remember to take deep breaths throughout the day to reduce stress.",
    "Stay hydrated! Aim for 8 glasses of water daily.",
    "Take short breaks every hour to stretch and move around.",
    "Practice gratitude by noting three things you're thankful for today.",
    "Try to get at least 7 hours of sleep tonight for better overall health."
  ], []);

  const randomTip = useMemo(() => dailyTips[Math.floor(Math.random() * dailyTips.length)], [dailyTips]);

  const quickActions = useMemo(() => [
    { title: "Log Sleep", link: "/sleep", icon: "🛌" },
    { title: "Track Workout", link: "/fitness", icon: "💪" },
    { title: "Meditate", link: "/meditation", icon: "🧘" },
    { title: "Journal", link: "/journal", icon: "📓" }
  ], []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="no-data">No dashboard data available</div>;
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
              <h2>Overall Wellbeing Score: {wellbeingScore}%</h2>
              <p>This score is based on your overall engagement with sleep tracking, fitness activities, mood logging, and meditation sessions.</p>
              <Link to="/wellbeing" className="improve-button">
                How to Improve Your Score
              </Link>
            </div>
          </div>
          
          <main className="dashboard-content">
            {Object.entries(dashboardData).map(([key, { data, emoji, link }], index) => (
              <MemoizedCard key={index} title={key} emoji={emoji} link={link}>
                {data.slice(0, 3).map((item, i) => (
                  <p key={i}>{Object.entries(item)[1][0]}: {Object.entries(item)[1][1]}</p>
                ))}
              </MemoizedCard>
            ))}
          </main>

          <section className="dashboard-additional-content">
            <div className="daily-tip">
              <h3>💡 Daily Tip</h3>
              <p>{randomTip}</p>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link} className="quick-action-button">
                    <span className="quick-action-icon">{action.icon}</span>
                    <span className="quick-action-title">{action.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="your-progress">
              <h3>Your Progress</h3>
              <div className="progress-bars">
                {Object.entries(dashboardData).map(([key, { data }], index) => (
                  <div key={index} className="progress-item">
                    <span>{key}</span>
                    <div className="progress-bar">
                      <div className="progress" style={{width: `${(data.length / 7) * 100}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Dashboard;