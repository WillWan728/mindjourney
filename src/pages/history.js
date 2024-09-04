import React from 'react';

const History = ({ exercises, meals, waterIntakes, handleDeleteExercise, handleDeleteMeal, handleDeleteWater }) => {
  const renderExerciseList = () => (
    <ul className="log-list">
      {exercises.map((exercise) => (
        <li key={exercise.id} className="log-item">
          <div className="log-item-content">
            <strong>{new Date(exercise.date).toLocaleDateString()}</strong> - {exercise.type}
            <br />
            Duration: {exercise.duration} minutes, Calories burned: {exercise.caloriesBurned}
            {exercise.distance && <span>, Distance: {exercise.distance} km</span>}
            {exercise.sets && <span>, Sets: {exercise.sets}</span>}
            {exercise.reps && <span>, Reps: {exercise.reps}</span>}
            {exercise.weight && <span>, Weight: {exercise.weight} kg</span>}
            {exercise.notes && <p>Notes: {exercise.notes}</p>}
          </div>
          <button onClick={() => handleDeleteExercise(exercise.id)} className="delete-button">Delete</button>
        </li>
      ))}
    </ul>
  );

  const renderMealList = () => (
    <ul className="log-list">
      {meals.map((meal) => (
        <li key={meal.id} className="log-item">
          <div className="log-item-content">
            <strong>{new Date(meal.date).toLocaleDateString()}</strong> - {meal.name}
            <br />
            Calories: {meal.calories}
            {meal.protein && <span>, Protein: {meal.protein}g</span>}
            {meal.carbs && <span>, Carbs: {meal.carbs}g</span>}
            {meal.fat && <span>, Fat: {meal.fat}g</span>}
            {meal.description && <p>Description: {meal.description}</p>}
            {meal.notes && <p>Notes: {meal.notes}</p>}
          </div>
          <button onClick={() => handleDeleteMeal(meal.id)} className="delete-button">Delete</button>
        </li>
      ))}
    </ul>
  );

  const renderWaterList = () => (
    <ul className="log-list">
      {waterIntakes.map((water) => (
        <li key={water.id} className="log-item">
          <div className="log-item-content">
            <strong>{new Date(water.date).toLocaleDateString()}</strong> {water.time}
            <br />
            Amount: {water.amount} ml, Type: {water.type}
            {water.notes && <p>Notes: {water.notes}</p>}
          </div>
          <button onClick={() => handleDeleteWater(water.id)} className="delete-button">Delete</button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="fitness-history">
      <h2>Exercise History</h2>
      {exercises.length > 0 ? renderExerciseList() : <p>No exercises logged yet.</p>}
      
      <h2>Meal History</h2>
      {meals.length > 0 ? renderMealList() : <p>No meals logged yet.</p>}
      
      <h2>Water Intake History</h2>
      {waterIntakes.length > 0 ? renderWaterList() : <p>No water intake logged yet.</p>}
    </div>
  );
};

export default History;