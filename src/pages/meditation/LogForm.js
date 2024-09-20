import React, { useState } from 'react';
import { INITIAL_MEDITATION_STATE, MEDITATION_EXERCISES, addMeditation } from '../../backend/meditation';

const LogForm = ({ user, fetchMeditationLogs }) => {
  const [newMeditation, setNewMeditation] = useState(INITIAL_MEDITATION_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeditation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to record a meditation.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await addMeditation(user.uid, newMeditation);
      setNewMeditation(INITIAL_MEDITATION_STATE);
      fetchMeditationLogs(user.uid);
    } catch (error) {
      console.error("Error saving meditation log: ", error);
      setError("Failed to save meditation log. Please try again.");
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
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Log Meditation'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default LogForm;