import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, Timestamp, doc, getDoc } from 'firebase/firestore';
import Navbar2 from './navbar2';
import { Link } from 'react-router-dom';
import '../css/dashboard.css';
import { calculateWellbeingScore, COMPONENT_WEIGHTS } from '../utils/wellbeingUtils';
import useFitnessData from '../hooks/fitnessHooks';
import useSleepData from '../hooks/sleepHooks';
import useMeditationData from '../hooks/meditationHooks';
import useMoodData from '../hooks/moodHooks';

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
  const [wellbeingScore, setWellbeingScore] = useState(null);
  const [weights, setWeights] = useState(COMPONENT_WEIGHTS);

  const fitnessData = useFitnessData();
  const sleepData = useSleepData();
  const meditationData = useMeditationData();
  const moodData = useMoodData();

  const fetchWeights = useCallback(async (userId) => {
    const userWeightsDoc = doc(db, 'userWellbeingSettings', userId);
    const userWeightsSnapshot = await getDoc(userWeightsDoc);
    if (userWeightsSnapshot.exists() && userWeightsSnapshot.data().weights) {
      setWeights(userWeightsSnapshot.data().weights);
    }
  }, []);

  const fetchDashboardData = useCallback((userId) => {
    const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    const queries = [
      { collection: 'Sleep', emoji: '💤', link: '/sleeptracker' },
      { collection: 'Exercise', emoji: '🏃‍♂️', link: '/fitness' },
      { collection: 'Journaling', emoji: '✏️', link: '/moodtracker' },
      { collection: 'Meditations', emoji: '🧘', link: '/mindfulness' },
      { collection: 'Goals', emoji: '🎯', link: '/goals' },
      { collection: 'Healthy Habit', emoji: '🥳', link: '/healthyhabit' },
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
        fetchWeights(user.uid);
      } else {
        setError("Please log in to view your dashboard.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchDashboardData, fetchWeights]);

  useEffect(() => {
    const calculateScore = async () => {
      if (fitnessData && sleepData && meditationData && moodData && auth.currentUser) {
        try {
          const score = await calculateWellbeingScore(
            auth.currentUser.uid,
            fitnessData,
            sleepData,
            meditationData,
            moodData.wellbeingScore,
            weights
          );
          setWellbeingScore(score.overallScore);
        } catch (error) {
          console.error('Error calculating wellbeing score:', error);
          setError('Failed to calculate wellbeing score.');
        }
      }
    };

    calculateScore();
  }, [fitnessData, sleepData, meditationData, moodData, weights]);

  const wellbeingScoreDisplay = useMemo(() => {
    return wellbeingScore !== null ? Math.round(wellbeingScore) : 'Calculating...';
  }, [wellbeingScore]);
  const mentalHealthResources = useMemo(() => [
    { 
      title: "National Suicide Prevention Lifeline", 
      description: "24/7, free and confidential support for people in distress.",
      link: "https://suicidepreventionlifeline.org/",
      phone: "1-800-273-8255"
    },
    { 
      title: "Crisis Text Line", 
      description: "Text HOME to 741741 to connect with a Crisis Counselor.",
      link: "https://www.crisistextline.org/",
      phone: "Text HOME to 741741"
    },
    { 
      title: "MIND UK", 
      description: "Offering support to people across England and Wales by providing advice and empowering people with mental health prolblems.",
      link: "https://www.mind.org.uk/about-us/contact-us/",
      phone: "0300 102 1234"
    },
    { 
      title: "Samaritans", 
      description: "A free helpline or online chat that is open 24/7 for people that need someone to talk to. ",
      link: "https://www.samaritans.org/how-we-can-help/contact-samaritan/?gad_source=1&gclid=Cj0KCQjwo8S3BhDeARIsAFRmkOMzCFFIsUOWQh4k0R7pJGPFHttcCYaeqcYl-aPqkdjnpC8r6RwAuIcaAmfpEALw_wcB",
      phone: "116 123"
    },
  ], []);

  const dailyTips = useMemo(() => [
    "Remember to take deep breaths throughout the day to reduce stress.",
    "Stay hydrated! Aim for 8 glasses of water daily.",
    "Take short breaks every hour to stretch and move around.",
    "Practice gratitude by noting three things you're thankful for today.",
    "Try to get at least 7 hours of sleep tonight for better overall health."
  ], []);

  const randomTip = useMemo(() => dailyTips[Math.floor(Math.random() * dailyTips.length)], [dailyTips]);
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
              <h2>Overall Wellbeing Score: {wellbeingScoreDisplay}%</h2>
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

            <div className="mental-health-resources">
              <h3>Mental Health Resources</h3>
              <div className="resources-grid">
                {mentalHealthResources.map((resource, index) => (
                  <div key={index} className="resource-card">
                    <h4>{resource.title}</h4>
                    <p>{resource.description}</p>
                    <p><strong>Phone:</strong> {resource.phone}</p>
                    <a href={resource.link} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Visit Website
                    </a>
                  </div>
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