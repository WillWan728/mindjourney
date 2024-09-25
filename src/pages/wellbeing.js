import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { calculateWellbeingScore, getComponentEmoji, getAdvice, getScoreCategory } from '../utils/wellbeingUtils';
import useFitnessData from '../hooks/fitnessHooks';
import useSleepData from '../hooks/sleepHooks';
import useMeditationData from '../hooks/meditationHooks';
import WellnessTrendGraph from '../utils/wellnessGraph';
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

  const handleWeightChange = (component, value) => {
    // Remove non-numeric characters and leading zeros
    const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
    
    // Ensure the value is within the range [0, 100]
    const finalValue = Math.max(0, Math.min(100, parseInt(cleanedValue, 10) || 0));
    
    // Update the weights
    setEditedWeights(prev => ({ ...prev, [component]: finalValue }));
  };


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
          <h1 className="dashboard-title">Your Wellbeing Dashboard</h1>
          
          <div className="overall-score">
            <div className="progress-wrapper">
              <progress value={overallScore} max="100"></progress>
            </div>
            <h2>Overall Wellbeing: {Math.round(overallScore)}%</h2>
            {needsRefresh && (
              <p className="refresh-notice">Your weights have changed. Click 'Refresh Scores' to update your wellbeing score.</p>
            )}
            <button onClick={refreshScores} className="refresh-btn">Refresh Scores</button>
          </div>
          
          <div className="component-row">
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
  
          <div className="wellness-trend-graph">
            <WellnessTrendGraph data={wellbeingData} />
          </div>
          
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'weights' ? 'active' : ''}`}
              onClick={() => setActiveTab('weights')}
            >
              Weight Adjustment
            </button>
            <button 
              className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              Detailed Progress
            </button>
          </div>
  
          {activeTab === 'weights' && (
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
          )}
  
          {activeTab === 'progress' && (
            <div className="progress-content">
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
  
          <div className="wellbeing-calculation-explanation">
            <h3>How Your Wellbeing Score is Calculated</h3>
            <p>Your overall wellbeing score is a weighted average of your individual component scores:</p>
            <ul>
              <li>Fitness: Based on your exercise minutes and calorie intake</li>
              <li>Sleep: Calculated from your sleep duration and quality</li>
              <li>Meditation: Derived from your meditation minutes and consistency</li>
              <li>Mood: Assessed from your daily mood ratings and factors</li>
            </ul>
            <p>Each component's score is multiplied by its weight (which you can adjust above), then these weighted scores are summed to give your overall wellbeing percentage.</p>
            <p>For example, if your components are:</p>
            <ul>
              <li>Fitness: 80% (weight 25%)</li>
              <li>Sleep: 70% (weight 25%)</li>
              <li>Meditation: 60% (weight 25%)</li>
              <li>Mood: 90% (weight 25%)</li>
            </ul>
            <p>Your overall score would be: (80 * 0.25) + (70 * 0.25) + (60 * 0.25) + (90 * 0.25) = 75%</p>
            <p>Adjust the weights to reflect the importance of each component in your personal wellbeing journey.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WellbeingDashboard;