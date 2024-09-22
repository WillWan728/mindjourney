import React from 'react';
import { useAchievement } from '../../utils/achievementUtils';
import { useNavigate } from 'react-router-dom';

const ExerciseForm = ({ exerciseForm, setExerciseForm, handleExerciseSubmit, loading }) => {
  const { updateDailyTask } = useAchievement();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      // First, submit the exercise data
      await handleExerciseSubmit(event);

      // Then, update the daily task for exercise
      const result = await updateDailyTask('exercise');
      if (result.success) {
        alert(`Exercise logged successfully! You earned ${result.pointsEarned} points.`);
        // Navigate to the achievements page
        navigate('/achievements');
      } else {
        alert(result.message || 'Failed to update achievement. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      alert('An error occurred while submitting the exercise. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const field = id.split('-')[1];
  
    setExerciseForm((prevForm) => ({
      ...prevForm,
      [field]: ['caloriesBurned', 'duration', 'distance', 'sets', 'reps', 'weight'].includes(field)
        ? (value === '' ? '' : (field === 'caloriesBurned' ? parseInt(value, 10) : parseFloat(value)))
        : value
    }));
  };

  return (
    <div className="exercise-log">
      <h2>Log Exercise</h2>
      <form onSubmit={onSubmit} className="fitness-form">
        <div className="form-group">
          <label htmlFor="exercise-date">Date</label>
          <input 
            id="exercise-date"
            type="date" 
            value={exerciseForm.date} 
            onChange={handleInputChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-type">Exercise Type</label>
          <input 
            id="exercise-type"
            type="text" 
            value={exerciseForm.type} 
            onChange={handleInputChange}
            placeholder="e.g., Running, Weightlifting, Yoga" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-duration">Duration (minutes)</label>
          <input 
            id="exercise-duration"
            type="number" 
            value={exerciseForm.duration} 
            onChange={handleInputChange}
            placeholder="Duration in minutes" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-caloriesBurned">Calories Burned</label>
          <input 
            id="exercise-caloriesBurned"
            type="number" 
            value={exerciseForm.caloriesBurned} 
            onChange={handleInputChange}
            placeholder="Estimated calories burned" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-distance">Distance (optional)</label>
          <input 
            id="exercise-distance"
            type="number" 
            value={exerciseForm.distance} 
            onChange={handleInputChange}
            placeholder="Distance in km (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-sets">Sets (optional)</label>
          <input 
            id="exercise-sets"
            type="number" 
            value={exerciseForm.sets} 
            onChange={handleInputChange}
            placeholder="Number of sets (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-reps">Reps (optional)</label>
          <input 
            id="exercise-reps"
            type="number" 
            value={exerciseForm.reps} 
            onChange={handleInputChange}
            placeholder="Number of reps (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-weight">Weight (optional)</label>
          <input 
            id="exercise-weight"
            type="number" 
            value={exerciseForm.weight} 
            onChange={handleInputChange}
            placeholder="Weight used in kg (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-notes">Notes (optional)</label>
          <textarea 
            id="exercise-notes"
            value={exerciseForm.notes} 
            onChange={handleInputChange}
            placeholder="Any additional notes" 
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Adding...' : 'Add Exercise'}
        </button>
      </form>
    </div>
  );
};

export default ExerciseForm;