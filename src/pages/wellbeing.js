import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { fetchExercises, fetchWater } from '../backend/fitness';
import { fetchMoods } from '../backend/moodDiary';
import { getSleepLogs } from '../backend/sleep';
import { fetchMeditations } from '../backend/meditation';
import {
  COMPONENT_WEIGHTS,
  calculateFitnessScore,
  calculateSleepScore,
  calculateMoodScore,
  calculateMeditationScore,
  calculateOverallWellbeingScore,
  getScoreCategory,
  getComponentEmoji
} from '../backend/wellbeing';
import Navbar2 from './navbar2';
import '../css/wellbeing.css';

const Card = ({ title, emoji, children }) => (
  <div className="card">
    <div className="card-header">
      <span className="emoji">{emoji}</span>
      <h3>{title}</h3>
    </div>
    <div className="card-content">
      {children}
    </div>
  </div>
);

const WellbeingPage = () => {
  const [wellbeingScore, setWellbeingScore] = useState(0);
  const [lastCalculated, setLastCalculated] = useState(null);
  const [componentScores, setComponentScores] = useState({
    fitness: 0,
    sleep: 0,
    mood: 0,
    meditation: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await calculateWellbeingScore(user.uid);
        } catch (err) {
          console.error("Error calculating wellbeing score:", err);
          setError("Failed to calculate wellbeing score. Please try again later.");
        }
      } else {
        setError("Please log in to view your wellbeing score.");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateWellbeingScore = async (userId) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    try {
      const exercises = await fetchExercises(userId, oneWeekAgo, now);
      const water = await fetchWater(userId, oneWeekAgo, now);
      const moods = await fetchMoods(userId, oneWeekAgo, now);
      const sleepLogs = await getSleepLogs(userId, oneWeekAgo, now);
      const meditations = await fetchMeditations(userId, oneWeekAgo, now);

      // Calculate component scores
      const newComponentScores = {
        fitness: Math.max(0, calculateFitnessScore(exercises, water)),
        sleep: Math.max(0, calculateSleepScore(sleepLogs)),
        mood: Math.max(0, calculateMoodScore(moods)),
        meditation: Math.max(0, calculateMeditationScore(meditations))
      };

      setComponentScores(newComponentScores);

      // Calculate overall wellbeing score
      const overallScore = calculateOverallWellbeingScore(newComponentScores);

      setWellbeingScore(Math.round(Math.max(0, overallScore)));
      setLastCalculated(now);
    } catch (error) {
      console.error('Error in calculateWellbeingScore:', error);
      setError('Failed to calculate wellbeing score. Please try again later.');
    }
  };

  const getAdvice = (componentName, score) => {
    const adviceMap = {
      fitness: {
        low: "Your fitness score is low. To reach 100%:\n" +
             "1. Exercise for at least 30 minutes every day.\n" +
             "2. Log your water intake daily, aiming for 8 glasses.\n" +
             "3. Mix cardio and strength training throughout the week.\n" +
             "4. Take at least 10,000 steps daily.",
        medium: "You're on the right track with fitness. To reach 100%:\n" +
                "1. Increase your exercise duration to 45-60 minutes daily.\n" +
                "2. Ensure you're logging all your water intake.\n" +
                "3. Add variety to your workouts (e.g., HIIT, yoga, swimming).\n" +
                "4. Aim for 12,000-15,000 steps daily.",
        high: "Great job on fitness! To achieve 100%:\n" +
              "1. Maintain your current exercise routine.\n" +
              "2. Log your water intake meticulously.\n" +
              "3. Consider adding more challenging exercises or increasing intensity.\n" +
              "4. Aim for over 15,000 steps daily."
      },
      sleep: {
        low: "Your sleep score needs improvement. To reach 100%:\n" +
             "1. Aim for 7-9 hours of sleep every night.\n" +
             "2. Establish a consistent sleep schedule, even on weekends.\n" +
             "3. Create a relaxing bedtime routine.\n" +
             "4. Avoid screens for at least 1 hour before bed.",
        medium: "Your sleep habits are good. To reach 100%:\n" +
                "1. Fine-tune your sleep duration to consistently get 8 hours.\n" +
                "2. Optimize your sleep environment (e.g., temperature, darkness, quiet).\n" +
                "3. Avoid caffeine after 2 PM.\n" +
                "4. Practice relaxation techniques before bed.",
        high: "Your sleep habits are excellent. To achieve 100%:\n" +
              "1. Maintain your current sleep schedule.\n" +
              "2. Monitor and log your sleep quality.\n" +
              "3. Consider using a sleep tracker for more detailed insights.\n" +
              "4. Experiment with sleep optimization techniques like meditation or light therapy."
      },
      mood: {
        low: "Your mood score can be improved. To reach 100%:\n" +
             "1. Practice daily gratitude journaling.\n" +
             "2. Engage in activities you enjoy every day.\n" +
             "3. Exercise regularly to boost endorphins.\n" +
             "4. Reach out to friends or a therapist for support.",
        medium: "Your mood is generally positive. To reach 100%:\n" +
                "1. Incorporate mindfulness or meditation into your daily routine.\n" +
                "2. Set and work towards personal goals.\n" +
                "3. Cultivate positive relationships.\n" +
                "4. Practice stress-management techniques.",
        high: "Your mood is great! To achieve 100%:\n" +
              "1. Maintain your current positive practices.\n" +
              "2. Share your happiness by helping others.\n" +
              "3. Challenge yourself with new experiences.\n" +
              "4. Reflect on and celebrate your achievements regularly."
      },
      meditation: {
        low: "Your meditation score is low. To reach 100%:\n" +
             "1. Start with 5 minutes of meditation daily.\n" +
             "2. Use guided meditation apps to help you get started.\n" +
             "3. Gradually increase your meditation time.\n" +
             "4. Aim for consistency rather than duration initially.",
        medium: "You're developing a good meditation habit. To reach 100%:\n" +
                "1. Increase your daily meditation time to 15-20 minutes.\n" +
                "2. Experiment with different meditation techniques.\n" +
                "3. Set a specific time each day for meditation.\n" +
                "4. Join a meditation group or class for motivation.",
        high: "Your meditation practice is strong. To achieve 100%:\n" +
              "1. Aim for 30 minutes of meditation daily.\n" +
              "2. Explore advanced meditation techniques.\n" +
              "3. Attend a meditation retreat.\n" +
              "4. Integrate mindfulness into your daily activities."
      }
    };

    const category = getScoreCategory(score);
    return (
      <>
        <p>{adviceMap[componentName][category]}</p>
        <p>Your current score: {Math.round(score)}%. Keep improving to reach 100%!</p>
      </>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <Navbar2 />
      <div className="dashboard-container">
        <div className="dashboard">
          <header className="dashboard-header">
            <h1>Your Wellbeing Dashboard</h1>
          </header>
          <div className="score-circle">
            <div className="score-content">
              <h2>{wellbeingScore}%</h2>
              <p>Overall Wellbeing</p>
            </div>
          </div>
          <p className="score-description">
            This score is calculated based on your fitness, sleep, mood, and meditation data over the past week.
          </p>
          <p className="last-calculated">
            Last calculated: {lastCalculated ? lastCalculated.toLocaleString() : 'Not yet calculated'}
          </p>

          <div className="component-grid">
            {Object.entries(componentScores).map(([component, score]) => (
              <Card key={component} title={component.charAt(0).toUpperCase() + component.slice(1)} emoji={getComponentEmoji(component)}>
                <p>Score: {Math.round(score)}%</p>
                <p>Weight: {COMPONENT_WEIGHTS[component] * 100}%</p>
                <div className="advice">
                  <h4>How to reach 100%:</h4>
                  {getAdvice(component, score)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WellbeingPage;