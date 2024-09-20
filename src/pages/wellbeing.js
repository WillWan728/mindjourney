import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { calculateWellbeingScore, getComponentEmoji, getAdvice, getScoreCategory } from '../utils/wellbeingUtils';
import useFitnessData from '../hooks/fitnessHooks';
import Navbar2 from './navbar2';
import '../css/wellbeing.css';

const WellbeingDashboard = () => {
  const [wellbeingData, setWellbeingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fitnessData = useFitnessData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }
        console.log("Fetching wellbeing data for user:", user.uid);
        console.log("Fitness data:", fitnessData);
        const data = await calculateWellbeingScore(user.uid, fitnessData);
        console.log("Received wellbeing data:", data);
        setWellbeingData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wellbeing data:', err);
        setError(`Failed to fetch wellbeing data: ${err.message}`);
        setLoading(false);
      }
    };

    if (!fitnessData.loading && auth.currentUser) {
      fetchData();
    }
  }, [fitnessData]);

  if (loading || fitnessData.loading) return <div className="loading">Loading data...</div>;
  if (error || fitnessData.error) return <div className="error">Error: {error || fitnessData.error}</div>;
  if (!wellbeingData || !fitnessData.wellbeingParams) return <div className="no-data">No data available.</div>;

  const { overallScore = 0, componentScores = {}, recentActivities = {}, goals = {} } = wellbeingData;

  return (
    <>
      <Navbar2 />
      <div className="wellbeing-dashboard-container">
        <div className="wellbeing-dashboard">
          <h1>Your Wellbeing Dashboard</h1>
          
          {/* Overall wellbeing score */}
          <div className="overall-score">
            <progress value={overallScore} max="100"></progress>
            <h2>Overall Wellbeing: {Math.round(overallScore)}%</h2>
          </div>
          
          {/* Component scores */}
          <div className="component-grid">
            {Object.entries(componentScores).map(([component, score]) => (
              <div key={component} className="component-card">
                <div className="component-header">
                  <span className="component-emoji">{getComponentEmoji(component)}</span>
                  <h3>{component.charAt(0).toUpperCase() + component.slice(1)}</h3>
                </div>
                <progress value={score} max="100"></progress>
                <p>{Math.round(score)}%</p>
                <p className="component-category">{getScoreCategory(score)}</p>
                <p className="component-advice">{getAdvice(component, score)}</p>
              </div>
            ))}
          </div>
          
          {/* Fitness Progress */}
          <div className="fitness-progress">
            <h3>Fitness Progress</h3>
            <div className="fitness-metric">
              <p>Weekly Exercise: {fitnessData.currentExerciseMinutes} / {goals.weeklyExerciseMinutes} minutes</p>
              <progress value={fitnessData.currentExerciseMinutes} max={goals.weeklyExerciseMinutes}></progress>
            </div>
            <div className="fitness-metric">
              <p>Daily Calories: {fitnessData.dailyCalories} / {goals.dailyCalorieTarget} calories</p>
              <progress value={fitnessData.dailyCalories} max={goals.dailyCalorieTarget}></progress>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div className="recent-activities">
            <h3>Recent Activities</h3>
            {recentActivities.exercises && recentActivities.exercises.length > 0 && (
              <div>
                <h4>Exercises</h4>
                <ul>
                  {recentActivities.exercises.map((exercise, index) => (
                    <li key={index}>
                      {new Date(exercise.date).toLocaleDateString()}: {exercise.type} - {exercise.duration} minutes
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recentActivities.meals && recentActivities.meals.length > 0 && (
              <div>
                <h4>Meals</h4>
                <ul>
                  {recentActivities.meals.map((meal, index) => (
                    <li key={index}>
                      {new Date(meal.date).toLocaleDateString()}: {meal.name} - {meal.calories} calories
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recentActivities.waterIntakes && recentActivities.waterIntakes.length > 0 && (
              <div>
                <h4>Water Intakes</h4>
                <ul>
                  {recentActivities.waterIntakes.map((water, index) => (
                    <li key={index}>
                      {new Date(water.date).toLocaleDateString()}: {water.amount} ml
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WellbeingDashboard;