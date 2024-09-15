import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Navbar from './navbar';
import '../css/wellbeingsetup.css'

const WellbeingSetup = () => {
  const navigate = useNavigate();
  const [wellbeingParams, setWellbeingParams] = useState({
    weeklyExerciseMinutes: '',
    dailyCalorieTarget: '2000',
    sleepHoursPerNight: '',
    targetMoodScore: '',
    weeklyMeditationMinutes: '',
    dailyMoodCheck: false,
  });

  useEffect(() => {
    const fetchWellbeingParams = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'wellbeing', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWellbeingParams(docSnap.data());
        }
      }
    };

    fetchWellbeingParams();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setWellbeingParams({ ...wellbeingParams, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'wellbeing', user.uid), wellbeingParams);
        await setDoc(doc(db, 'users', user.uid), { hasCompletedWellbeingSetup: true }, { merge: true });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving wellbeing parameters:', error);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="goal-setup-container">
        <h1>Set Your Wellbeing Parameters</h1>
        <form onSubmit={handleSubmit} className="goal-setup-form">
          <div className="form-group">
            <label htmlFor="weeklyExerciseMinutes">Weekly Exercise Target (minutes)</label>
            <input
              type="number"
              id="weeklyExerciseMinutes"
              name="weeklyExerciseMinutes"
              value={wellbeingParams.weeklyExerciseMinutes}
              onChange={handleChange}
              min="0"
              required
            />
            <small>Recommended: 150 minutes of moderate aerobic activity or 75 minutes of vigorous aerobic activity a week</small>
          </div>
          <div className="form-group">
            <label htmlFor="dailyCalorieTarget">Daily Calorie Target</label>
            <input
              type="number"
              id="dailyCalorieTarget"
              name="dailyCalorieTarget"
              value={wellbeingParams.dailyCalorieTarget}
              onChange={handleChange}
              min="1200"
              max="4000"
              required
            />
            <small>
              Average daily calorie needs: 2000-2500 for men, 1600-2000 for women. 
              Adjust based on your age, height, weight, and activity level.
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="sleepHoursPerNight">Sleep Target (hours per night)</label>
            <input
              type="number"
              id="sleepHoursPerNight"
              name="sleepHoursPerNight"
              value={wellbeingParams.sleepHoursPerNight}
              onChange={handleChange}
              min="0"
              max="24"
              step="0.5"
              required
            />
            <small>Recommended: 7-9 hours per night for adults</small>
          </div>
          <div className="form-group mood-check-group">
            <label htmlFor="dailyMoodCheck">Commit to daily mood awareness check-in</label>
            <small>Taking a moment each day to reflect on your emotional state can improve self-awareness and emotional intelligence.</small>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="dailyMoodCheck"
                name="dailyMoodCheck"
                checked={wellbeingParams.dailyMoodCheck}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="weeklyMeditationMinutes">Weekly Meditation Target (minutes)</label>
            <input
              type="number"
              id="weeklyMeditationMinutes"
              name="weeklyMeditationMinutes"
              value={wellbeingParams.weeklyMeditationMinutes}
              onChange={handleChange}
              min="0"
              required
            />
            <small>Start with a small, achievable goal like 10-15 minutes per day</small>
          </div>
          <button type="submit" className="submit-button">Save Wellbeing Parameters</button>
        </form>
      </div>
    </>
  );
};

export default WellbeingSetup;