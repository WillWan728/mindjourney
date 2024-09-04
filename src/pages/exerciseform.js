import React from 'react';

const ExerciseForm = ({ exerciseForm, setExerciseForm, handleExerciseSubmit, loading }) => {
  return (
    <div className="exercise-log">
      <h2>Log Exercise</h2>
      <form onSubmit={handleExerciseSubmit} className="fitness-form">
        <div className="form-group">
          <label htmlFor="exercise-date">Date</label>
          <input 
            id="exercise-date"
            type="date" 
            value={exerciseForm.date} 
            onChange={(e) => setExerciseForm({...exerciseForm, date: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-type">Exercise Type</label>
          <input 
            id="exercise-type"
            type="text" 
            value={exerciseForm.type} 
            onChange={(e) => setExerciseForm({...exerciseForm, type: e.target.value})} 
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
            onChange={(e) => setExerciseForm({...exerciseForm, duration: e.target.value})} 
            placeholder="Duration in minutes" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-calories">Calories Burned</label>
          <input 
            id="exercise-calories"
            type="number" 
            value={exerciseForm.caloriesBurned} 
            onChange={(e) => setExerciseForm({...exerciseForm, caloriesBurned: e.target.value})} 
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
            onChange={(e) => setExerciseForm({...exerciseForm, distance: e.target.value})} 
            placeholder="Distance in km (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-sets">Sets (optional)</label>
          <input 
            id="exercise-sets"
            type="number" 
            value={exerciseForm.sets} 
            onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})} 
            placeholder="Number of sets (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-reps">Reps (optional)</label>
          <input 
            id="exercise-reps"
            type="number" 
            value={exerciseForm.reps} 
            onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})} 
            placeholder="Number of reps (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-weight">Weight (optional)</label>
          <input 
            id="exercise-weight"
            type="number" 
            value={exerciseForm.weight} 
            onChange={(e) => setExerciseForm({...exerciseForm, weight: e.target.value})} 
            placeholder="Weight used in kg (if applicable)" 
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-notes">Notes (optional)</label>
          <textarea 
            id="exercise-notes"
            value={exerciseForm.notes} 
            onChange={(e) => setExerciseForm({...exerciseForm, notes: e.target.value})} 
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