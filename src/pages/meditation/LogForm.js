import React, { useState, useEffect } from 'react';
import { INITIAL_MEDITATION_STATE, MEDITATION_EXERCISES } from '../../backend/meditation';
import { useAchievement } from '../../utils/achievementUtils';
import { useNavigate } from 'react-router-dom';

const LogForm = ({ user }) => {
  const [newMeditation, setNewMeditation] = useState(INITIAL_MEDITATION_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { 
    updateDailyTask, 
    updateExtendedTask, 
    getAchievementProgress, 
    achievements 
  } = useAchievement();
  const navigate = useNavigate();

  useEffect(() => {
    // Set the default date to today
    setNewMeditation(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeditation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("Please log in to record a meditation.");
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      // Update the daily meditation task
      const dailyResult = await updateDailyTask('meditation');
      
      // Update the Zen Champion extended task
      const extendedResult = await updateExtendedTask('meditate_all');
      
      if (dailyResult.success && extendedResult.success) {
        const zenChampionProgress = getAchievementProgress('meditate_all');
        setMessage(`Meditation saved!`);
        setNewMeditation(prev => ({ ...INITIAL_MEDITATION_STATE, date: prev.date }));
      } else {
        setMessage('Failed to log meditation. Please try again.');
      }
    } catch (error) {
      console.error("Error saving meditation log: ", error);
      setMessage("Failed to save meditation log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="meditation-form">
      <h2>Log Your Meditation</h2>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={newMeditation.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="duration">Duration (minutes):</label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={newMeditation.duration}
          onChange={handleInputChange}
          placeholder="Duration in minutes"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="exercise">Exercise:</label>
        <select
          id="exercise"
          name="exercise"
          value={newMeditation.exercise}
          onChange={handleInputChange}
          required
        >
          <option value="">Select an exercise</option>
          {MEDITATION_EXERCISES.map(exercise => (
            <option key={exercise.title} value={exercise.title}>
              {exercise.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes:</label>
        <textarea
          id="notes"
          name="notes"
          value={newMeditation.notes}
          onChange={handleInputChange}
          placeholder="Any thoughts or feelings about your session?"
        />
      </div>
      <div className="achievement-progress">
        <h3>Zen Champion Progress</h3>
        <p>{getAchievementProgress('meditate_all')}/30 days</p>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Log Meditation'}
      </button>
      {message && <p className="message">{message}</p>}
    </form>
  );
};

export default LogForm;