import React, { useState } from 'react';

const History = ({ exercises, meals, waterIntakes, handleDeleteExercise, handleDeleteMeal, handleDeleteWater }) => {
  const [activeTab, setActiveTab] = useState('exercise');

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const ExerciseItem = ({ exercise }) => {
    return (
      <li className="history-item">
        <div className="history-content">
          <strong>{formatDate(exercise.date)}</strong> - {exercise.type}
          <br />
          Duration: {exercise.duration} minutes
          <br />
          Calories burned: {exercise.caloriesBurned}
          {exercise.distance > 0 && <>, Distance: {exercise.distance} km</>}
          {exercise.sets > 0 && <>, Sets: {exercise.sets}</>}
          {exercise.reps > 0 && <>, Reps: {exercise.reps}</>}
          {exercise.weight > 0 && <>, Weight: {exercise.weight} kg</>}
          {exercise.notes && <p className="history-notes">Notes: {exercise.notes}</p>}
        </div>
        <button 
          onClick={() => handleDeleteExercise(exercise.id)}
          className="delete-btn red-btn"
        >
          Delete
        </button>
      </li>
    );
  };

  const ExerciseHistory = ({ exercises }) => (
    <div className="exercise-history">
      <h3>Exercise History</h3>
      {exercises.length === 0 ? (
        <p>No exercise entries yet.</p>
      ) : (
        <ul className="history-list">
          {exercises.map((exercise) => (
            <ExerciseItem key={exercise.id} exercise={exercise} />
          ))}
        </ul>
      )}
    </div>
  );

  const MealHistory = ({ meals }) => (
    <div className="meal-history">
      <h3>Meal History</h3>
      {meals.length === 0 ? (
        <p>No meal entries yet.</p>
      ) : (
        <ul className="history-list">
          {meals.map((meal) => (
            <li key={meal.id} className="history-item">
              <div className="history-content">
                <strong>{formatDate(meal.date)}</strong> - {meal.name}
                <br />
                Calories: {meal.calories}
                {meal.protein && <>, Protein: {meal.protein}g</>}
                {meal.carbs && <>, Carbs: {meal.carbs}g</>}
                {meal.fat && <>, Fat: {meal.fat}g</>}
                {meal.notes && <p className="history-notes">Notes: {meal.notes}</p>}
              </div>
              <button 
                onClick={() => handleDeleteMeal(meal.id)}
                className="delete-btn red-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const WaterHistory = ({ waterIntakes }) => (
    <div className="water-history">
      <h3>Water Intake History</h3>
      {waterIntakes.length === 0 ? (
        <p>No water intake entries yet.</p>
      ) : (
        <ul className="history-list">
          {waterIntakes.map((water) => (
            <li key={water.id} className="history-item">
              <div className="history-content">
                <strong>{formatDate(water.date)}</strong>
                <br />
                Amount: {water.amount} ml
                {water.notes && <p className="history-notes">Notes: {water.notes}</p>}
              </div>
              <button 
                onClick={() => handleDeleteWater(water.id)}
                className="delete-btn red-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="history-container">
      <div className="history-tabs tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'exercise' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercise')}
        >
          Exercise
        </button>
        <button 
          className={`tab-btn ${activeTab === 'meal' ? 'active' : ''}`}
          onClick={() => setActiveTab('meal')}
        >
          Meals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'water' ? 'active' : ''}`}
          onClick={() => setActiveTab('water')}
        >
          Water
        </button>
      </div>

      <div className="history-content">
        {activeTab === 'exercise' && <ExerciseHistory exercises={exercises} />}
        {activeTab === 'meal' && <MealHistory meals={meals} />}
        {activeTab === 'water' && <WaterHistory waterIntakes={waterIntakes} />}
      </div>
    </div>
  );
};

export default History;