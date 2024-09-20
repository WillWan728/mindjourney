import React, { useState } from 'react';
import { MEDITATION_EXERCISES, EXERCISE_CATEGORIES } from '../../backend/meditation';

const ExerciseForm = () => {
  const [selectedCategory, setSelectedCategory] = useState(EXERCISE_CATEGORIES[0]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  return (
    <div className="exercises-container">
      <div className="category-buttons">
        {EXERCISE_CATEGORIES.map(category => (
          <button 
            key={category} 
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="exercise-grid">
        {MEDITATION_EXERCISES
          .filter(exercise => selectedCategory === 'All' || exercise.category === selectedCategory)
          .map((exercise, index) => (
            <div key={index} className="exercise-card" onClick={() => setSelectedExercise(exercise)}>
              <h3>{exercise.title}</h3>
              <p>{exercise.description}</p>
            </div>
          ))
        }
      </div>
      {selectedExercise && (
        <div className="exercise-details">
          <h2>{selectedExercise.title}</h2>
          <p>{selectedExercise.description}</p>
          <ol>
            {selectedExercise.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <button onClick={() => setSelectedExercise(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ExerciseForm;