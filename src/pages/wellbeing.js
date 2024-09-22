import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { calculateWellbeingScore, getComponentEmoji, getAdvice, getScoreCategory } from '../utils/wellbeingUtils';
import useFitnessData from '../hooks/fitnessHooks';
import useSleepData from '../hooks/sleepHooks';
import useMeditationData from '../hooks/meditationHooks';
import useMoodData from '../hooks/moodHooks';
import Navbar2 from './navbar2';
import '../css/wellbeing.css';

const defaultWeights = {
  fitness: 25,
  sleep: 25,
  meditation: 25,
  mood: 25
};

const WellbeingDashboard = () => {
  const [wellbeingData, setWellbeingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('progress');
  const [weights, setWeights] = useState(defaultWeights);
  const [editedWeights, setEditedWeights] = useState(defaultWeights);
  const [weightError, setWeightError] = useState('');
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [triggerRecalculation, setTriggerRecalculation] = useState(0);
  
  const fitnessData = useFitnessData();
  const sleepData = useSleepData();
  const meditationData = useMeditationData();
  const moodData = useMoodData();

  const handleWeightChange = useCallback((component, value) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value.replace(/^0+/, '')) || 0));
    setEditedWeights(prev => ({ ...prev, [component]: newValue }));
  }, []);

  const calculateData = useCallback(async () => {
    try {
      console.log('Starting wellbeing calculation');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (fitnessData.loading || sleepData.loading || meditationData.loading || moodData.loading) {
        console.log('Some data is still loading');
        return;
      }

      const data = await calculateWellbeingScore(
        user.uid,
        fitnessData,
        sleepData,
        meditationData,
        moodData.wellbeingScore,
        weights
      );
      console.log("Calculated wellbeing data:", data);
      setWellbeingData(data);
      setLoading(false);
      setNeedsRefresh(false);
    } catch (err) {
      console.error('Error calculating wellbeing data:', err);
      setError(`Failed to calculate wellbeing data: ${err.message}`);
      setLoading(false);
    }
  }, [fitnessData, sleepData, meditationData, moodData, weights]);

  useEffect(() => {
    const fetchWeights = async () => {
      const user = auth.currentUser;
      if (user) {
        const userWeightsDoc = doc(db, 'userWellbeingSettings', user.uid);
        const userWeightsSnapshot = await getDoc(userWeightsDoc);
        if (userWeightsSnapshot.exists() && userWeightsSnapshot.data().weights) {
          const savedWeights = userWeightsSnapshot.data().weights;
          setWeights(savedWeights);
          setEditedWeights(savedWeights);
        } else {
          // If no weights are saved, initialize with default weights
          await setDoc(userWeightsDoc, { weights: defaultWeights });
          setWeights(defaultWeights);
          setEditedWeights(defaultWeights);
        }
      }
    };

    fetchWeights();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && (needsRefresh || !wellbeingData || triggerRecalculation > 0)) {
      calculateData();
    }
  }, [calculateData, needsRefresh, wellbeingData, triggerRecalculation]);

  const confirmWeightChanges = async () => {
    const totalWeight = Object.values(editedWeights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight !== 100) {
      setWeightError('Total weight must equal 100%');
    } else {
      setWeights(editedWeights);
      setWeightError('');
      
      // Save weights to Firebase
      const user = auth.currentUser;
      if (user) {
        const userWeightsDoc = doc(db, 'userWellbeingSettings', user.uid);
        await setDoc(userWeightsDoc, { weights: editedWeights }, { merge: true });
        setConfirmationMessage('Changes confirmed successfully!');
        setTimeout(() => setConfirmationMessage(''), 3000);  // Clear message after 3 seconds
        
        // Trigger immediate recalculation
        setTriggerRecalculation(prev => prev + 1);
      }
    }
  };

  const resetWeights = async () => {
    setEditedWeights(defaultWeights);
    setWeights(defaultWeights);
    setWeightError('');
    
    // Reset weights in Firebase
    const user = auth.currentUser;
    if (user) {
      const userWeightsDoc = doc(db, 'userWellbeingSettings', user.uid);
      await setDoc(userWeightsDoc, { weights: defaultWeights }, { merge: true });
      setConfirmationMessage('Weights reset to default!');
      setTimeout(() => setConfirmationMessage(''), 3000);  // Clear message after 3 seconds
      
      // Trigger immediate recalculation
      setTriggerRecalculation(prev => prev + 1);
    }
  };

  const refreshScores = () => {
    setNeedsRefresh(true);
    setConfirmationMessage('Refreshing scores...');
    setTimeout(() => setConfirmationMessage(''), 3000);  // Clear message after 3 seconds
  };

  if (loading || fitnessData.loading || sleepData.loading || meditationData.loading || moodData.loading) {
    return <div className="loading">Loading your wellbeing data...</div>;
  }

  if (error || fitnessData.error || sleepData.error || meditationData.error || moodData.error) {
    return <div className="error">
      Error: {error || fitnessData.error || sleepData.error || meditationData.error || moodData.error}
    </div>;
  }

  if (!wellbeingData) {
    return <div className="no-data">No wellbeing data available. Start tracking to see your progress!</div>;
  }

  const { overallScore = 0, componentScores = {}, goals = {}, recentActivities = {} } = wellbeingData;
  const totalEditedWeight = Object.values(editedWeights).reduce((sum, weight) => sum + weight, 0);




  return (
    <>
      <Navbar2 />
      <div className="wellbeing-dashboard-container">
        <div className="wellbeing-dashboard">
          <h1>Your Wellbeing Dashboard</h1>
          
          <div className="overall-score">
            <progress value={overallScore} max="100"></progress>
            <h2>Overall Wellbeing: {Math.round(overallScore)}%</h2>
            {needsRefresh && (
              <p className="refresh-notice">Your weights have changed. Click 'Refresh Scores' to update your wellbeing score.</p>
            )}
            <button onClick={refreshScores} className="refresh-btn">Refresh Scores</button>
          </div>
          
          <div className="weight-adjustment">
            <h3>Adjust Component Weights</h3>
            <p className="weight-info">
              You can adjust the importance of each component in your overall wellbeing score.
              The total should add up to 100%. Your changes will be saved automatically.
            </p>
            {Object.entries(editedWeights).map(([component, weight]) => (
              <div key={component} className="weight-input">
                <label htmlFor={`${component}-weight`}>{component.charAt(0).toUpperCase() + component.slice(1)}:</label>
                <input
                  type="number"
                  id={`${component}-weight`}
                  value={weight}
                  onChange={(e) => handleWeightChange(component, e.target.value)}
                  min="0"
                  max="100"
                />
                <span>%</span>
              </div>
            ))}
            <p className={`total-weight ${totalEditedWeight !== 100 ? 'invalid' : ''}`}>
              Total: {totalEditedWeight}%
            </p>
            {weightError && <p className="weight-error">{weightError}</p>}
            {confirmationMessage && <p className="confirmation-message">{confirmationMessage}</p>}
            <button onClick={confirmWeightChanges} className="confirm-weights-btn">Confirm Changes</button>
            <button onClick={resetWeights} className="reset-weights-btn">Reset to Default</button>
          </div>

          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              Progress
            </button>
            <button 
              className={`tab-button ${activeTab === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              Recent Activities
            </button>
          </div>

          {activeTab === 'progress' && (
            <div className="progress-content">
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
              
              <div className="sleep-progress">
                <h3>Sleep Progress</h3>
                <div className="sleep-metric">
                  <p>Last Night's Sleep: {sleepData.currentSleepDuration.toFixed(1)} / {goals.sleepHoursPerNight} hours</p>
                  <progress value={sleepData.currentSleepDuration} max={goals.sleepHoursPerNight}></progress>
                </div>
              </div>
              
              <div className="meditation-progress">
                <h3>Meditation Progress</h3>
                <div className="meditation-metric">
                  <p>Weekly Meditation: {meditationData.totalMeditationMinutes} / {goals.weeklyMeditationMinutes} minutes</p>
                  <progress value={meditationData.totalMeditationMinutes} max={goals.weeklyMeditationMinutes}></progress>
                </div>
              </div>

              <div className="mood-progress">
                <h3>Mood Progress</h3>
                <div className="mood-metric">
                  <p>Current Mood Streak: {moodData.streak} days</p>
                </div>
                <div className="mood-metric">
                  <p>Average Mood Score: {moodData.avgMoodScore.toFixed(2)} / 5</p>
                </div>
                <div className="mood-metric">
                  <p>Mood Wellbeing Score: {moodData.wellbeingScore}%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
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
              {recentActivities.meditations && recentActivities.meditations.length > 0 && (
                <div>
                  <h4>Recent Meditations</h4>
                  <ul>
                    {recentActivities.meditations.map((meditation, index) => (
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
                        {mood.factors && mood.factors.length > 0 && ` (Factors: ${mood.factors.join(', ')})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WellbeingDashboard;