import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { calculateWellbeingScore, getComponentEmoji, getAdvice, getScoreCategory } from '../utils/wellbeingUtils';
import useFitnessData from '../hooks/fitnessHooks';
import useSleepData from '../hooks/sleepHooks';
import useMeditationData from '../hooks/meditationHooks';
import useMoodData, { calculateMoodScoreForWellbeing } from '../hooks/moodHooks';
import '../css/wellbeing.css';
import Navbar2 from './navbar2';

const WellbeingDashboard = () => {
  const [wellbeingData, setWellbeingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fitnessData = useFitnessData();
  const sleepData = useSleepData();
  const meditationData = useMeditationData();
  const moodData = useMoodData();

  useEffect(() => {
    const calculateData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        console.log("Calculating wellbeing data for user:", user.uid);
        console.log("Fitness data:", fitnessData);
        console.log("Sleep data:", sleepData);
        console.log("Meditation data:", meditationData);
        console.log("Mood data:", moodData);

        const moodScore = calculateMoodScoreForWellbeing(moodData.moods);
        
        const data = await calculateWellbeingScore(user.uid, fitnessData, sleepData, meditationData, moodScore);
        console.log("Calculated wellbeing data:", data);
        setWellbeingData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error calculating wellbeing data:', err);
        setError(`Failed to calculate wellbeing data: ${err.message}`);
        setLoading(false);
      }
    };

    if (!fitnessData.loading && !sleepData.loading && !meditationData.loading && !moodData.loading && auth.currentUser) {
      calculateData();
    }
  }, [fitnessData, sleepData, meditationData, moodData]);

  if (loading || fitnessData.loading || sleepData.loading || meditationData.loading || moodData.loading) {
    return <div className="loading">Loading your wellbeing data...</div>;
  }

  if (error || fitnessData.error || sleepData.error || meditationData.error || moodData.error) {
    return <div className="error">Error: {error || fitnessData.error || sleepData.error || meditationData.error || moodData.error}</div>;
  }

  if (!wellbeingData || !fitnessData.wellbeingParams || !sleepData.sleepGoal || !meditationData.meditations || !moodData.moods) {
    return <div className="no-data">No wellbeing data available. Start tracking to see your progress!</div>;
  }

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
          
          {/* Sleep Progress */}
          <div className="sleep-progress">
            <h3>Sleep Progress</h3>
            <div className="sleep-metric">
              <p>Last Night's Sleep: {sleepData.currentSleepDuration.toFixed(1)} / {goals.sleepHoursPerNight} hours</p>
              <progress value={sleepData.currentSleepDuration} max={goals.sleepHoursPerNight}></progress>
            </div>
          </div>
          
          {/* Meditation Progress */}
          <div className="meditation-progress">
            <h3>Meditation Progress</h3>
            <div className="meditation-metric">
              <p>Weekly Meditation: {meditationData.totalMeditationMinutes} / {goals.weeklyMeditationMinutes} minutes</p>
              <progress value={meditationData.totalMeditationMinutes} max={goals.weeklyMeditationMinutes}></progress>
            </div>
          </div>

          {/* Mood Progress */}
          <div className="mood-progress">
            <h3>Mood Progress</h3>
            <div className="mood-metric">
              <p>Current Mood Streak: {moodData.streak} days</p>
            </div>
            <div className="mood-metric">
              <p>Average Mood Score: {moodData.avgMoodScore.toFixed(2)} / 5</p>
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
            {recentActivities.sleepLogs && recentActivities.sleepLogs.length > 0 && (
              <div>
                <h4>Sleep Logs</h4>
                <ul>
                  {recentActivities.sleepLogs.map((log, index) => {
                    const bedtime = new Date(log.bedtime);
                    const waketime = new Date(log.waketime);
                    let duration = (waketime - bedtime) / (1000 * 60 * 60); // in hours
                    if (duration < 0) duration += 24; // Adjust for sleep past midnight
                    return (
                      <li key={index}>
                        {new Date(log.date).toLocaleDateString()}: {duration.toFixed(1)} hours (Quality: {log.quality}/10)
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {meditationData.meditations && meditationData.meditations.length > 0 && (
              <div>
                <h4>Recent Meditations</h4>
                <ul>
                  {meditationData.meditations.slice(-5).map((meditation, index) => (
                    <li key={index}>
                      {new Date(meditation.date).toLocaleDateString()}: {meditation.exercise} - {meditation.duration} minutes
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {moodData.moods && moodData.moods.length > 0 && (
              <div>
                <h4>Recent Moods</h4>
                <ul>
                  {moodData.moods.slice(0, 5).map((mood, index) => (
                    <li key={index}>
                      {new Date(mood.date).toLocaleDateString()}: {mood.mood} 
                      {mood.factors.length > 0 && ` (Factors: ${mood.factors.join(', ')})`}
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