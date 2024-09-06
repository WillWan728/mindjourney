// FitnessTracker.js
import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { addExercise, fetchExercises, addMeal, fetchMeals, deleteExercise, deleteMeal, addWater, fetchWater, deleteWater } from '../backend/fitness';
import Navbar2 from './navbar2';
import '../css/fitnesstracker.css';

const FitnessTracker = () => {
  const [user, setUser] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [waterIntakes, setWaterIntakes] = useState([]);
  const [exerciseForm, setExerciseForm] = useState({ type: '', duration: '', caloriesBurned: '', date: '', distance: '', notes: '' });
  const [mealForm, setMealForm] = useState({ name: '', calories: '', date: '' });
  const [waterForm, setWaterForm] = useState({ amount: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exercise');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchData();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exercisesData, mealsData, waterData] = await Promise.all([
        fetchExercises(),
        fetchMeals(),
        fetchWater()
      ]);
      setExercises(exercisesData);
      setMeals(mealsData);
      setWaterIntakes(waterData);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addExercise(exerciseForm);
      await fetchData();
      setExerciseForm({ type: '', duration: '', caloriesBurned: '', date: '', distance: '', notes: '' });
    } catch (error) {
      console.error("Error submitting exercise: ", error);
      setError("Failed to add exercise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addMeal(mealForm);
      await fetchData();
      setMealForm({ name: '', calories: '', date: '' });
    } catch (error) {
      console.error("Error submitting meal: ", error);
      setError("Failed to add meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWaterSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addWater(waterForm);
      await fetchData();
      setWaterForm({ amount: '', date: '' });
    } catch (error) {
      console.error("Error submitting water intake: ", error);
      setError("Failed to add water intake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      setLoading(true);
      await deleteExercise(exerciseId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting exercise: ", error);
      setError("Failed to delete exercise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      setLoading(true);
      await deleteMeal(mealId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting meal: ", error);
      setError("Failed to delete meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWater = async (waterId) => {
    try {
      setLoading(true);
      await deleteWater(waterId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting water intake: ", error);
      setError("Failed to delete water intake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access the Fitness Tracker.</div>;
  }

  return (
    <>
      <Navbar2 />
      <div className="fitness-tracker-container">
        <h1 className="main-title">Fitness Tracker</h1>
        {error && <div className="error-message">{error}</div>}
        <div className="tab-navigation">
          <button 
            className={activeTab === 'exercise' ? 'active' : ''} 
            onClick={() => setActiveTab('exercise')}
          >
            Log Exercise
          </button>
          <button 
            className={activeTab === 'meal' ? 'active' : ''} 
            onClick={() => setActiveTab('meal')}
          >
            Log Meal
          </button>
          <button 
            className={activeTab === 'water' ? 'active' : ''} 
            onClick={() => setActiveTab('water')}
          >
            Log Water
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'exercise' && (
            <div className="add-fitness-log">
              <h2>Log Exercise</h2>
              <ExerciseForm 
                exerciseForm={exerciseForm}
                setExerciseForm={setExerciseForm}
                handleExerciseSubmit={handleExerciseSubmit}
                loading={loading}
              />
            </div>
          )}
          
          {activeTab === 'meal' && (
            <div className="add-fitness-log">
              <h2>Log Meal</h2>
              <MealForm 
                mealForm={mealForm}
                setMealForm={setMealForm}
                handleMealSubmit={handleMealSubmit}
                loading={loading}
              />
            </div>
          )}
          
          {activeTab === 'water' && (
            <div className="add-fitness-log">
              <h2>Log Water Intake</h2>
              <WaterForm 
                waterForm={waterForm}
                setWaterForm={setWaterForm}
                handleWaterSubmit={handleWaterSubmit}
                loading={loading}
              />
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="fitness-history">
              <History 
                exercises={exercises}
                meals={meals}
                waterIntakes={waterIntakes}
                handleDeleteExercise={handleDeleteExercise}
                handleDeleteMeal={handleDeleteMeal}
                handleDeleteWater={handleDeleteWater}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const ExerciseForm = ({ exerciseForm, setExerciseForm, handleExerciseSubmit, loading }) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if ((id === 'duration' || id === 'caloriesBurned' || id === 'distance') && Number(value) < 0) {
      return; // Prevent negative values
    }
    setExerciseForm({ ...exerciseForm, [id]: value });
  };

  return (
    <form onSubmit={handleExerciseSubmit} className="fitness-form">
      <div className="form-group">
        <label htmlFor="type">Exercise Type:</label>
        <input
          type="text"
          id="type"
          value={exerciseForm.type}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="duration">Duration (minutes):</label>
        <input
          type="number"
          id="duration"
          value={exerciseForm.duration}
          onChange={handleInputChange}
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="caloriesBurned">Calories Burned:</label>
        <input
          type="number"
          id="caloriesBurned"
          value={exerciseForm.caloriesBurned}
          onChange={handleInputChange}
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={exerciseForm.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="distance">Distance (optional):</label>
        <input
          type="number"
          id="distance"
          value={exerciseForm.distance}
          onChange={handleInputChange}
          min="0"
        />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes (optional):</label>
        <textarea
          id="notes"
          value={exerciseForm.notes}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" disabled={loading}>Submit Exercise</button>
    </form>
  );
};

const MealForm = ({ mealForm, setMealForm, handleMealSubmit, loading }) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'calories' && Number(value) < 0) {
      return; // Prevent negative values
    }
    setMealForm({ ...mealForm, [id]: value });
  };

  return (
    <form onSubmit={handleMealSubmit} className="fitness-form">
      <div className="form-group">
        <label htmlFor="name">Meal Name:</label>
        <input
          type="text"
          id="name"
          value={mealForm.name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="calories">Calories:</label>
        <input
          type="number"
          id="calories"
          value={mealForm.calories}
          onChange={handleInputChange}
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={mealForm.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit" disabled={loading}>Submit Meal</button>
    </form>
  );
};

const WaterForm = ({ waterForm, setWaterForm, handleWaterSubmit, loading }) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'amount' && Number(value) < 0) {
      return; // Prevent negative values
    }
    setWaterForm({ ...waterForm, [id]: value });
  };

  return (
    <form onSubmit={handleWaterSubmit} className="fitness-form">
      <div className="form-group">
        <label htmlFor="amount">Water Amount (ml):</label>
        <input
          type="number"
          id="amount"
          value={waterForm.amount}
          onChange={handleInputChange}
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={waterForm.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <button type="submit" disabled={loading}>Submit Water Intake</button>
    </form>
  );
};

const History = ({ exercises, meals, waterIntakes, handleDeleteExercise, handleDeleteMeal, handleDeleteWater }) => {
  return (
    <>
      <div className="history-section">
        <h2>Exercise History</h2>
        <ul className="log-list">
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <p>
                {new Date(exercise.date).toLocaleDateString()} - {exercise.type}: 
                Duration: {exercise.duration} minutes, 
                Calories burned: {exercise.caloriesBurned}
                {exercise.distance && `, Distance: ${exercise.distance}`}
                {exercise.notes && <br />}
                {exercise.notes}
              </p>
              <button onClick={() => handleDeleteExercise(exercise.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="history-section">
        <h2>Meal History</h2>
        <ul className="log-list">
          {meals.map((meal) => (
            <li key={meal.id}>
              <p>
                {new Date(meal.date).toLocaleDateString()} - {meal.name}: 
                Calories: {meal.calories}
              </p>
              <button onClick={() => handleDeleteMeal(meal.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="history-section">
        <h2>Water Intake History</h2>
        <ul className="log-list">
          {waterIntakes.map((water) => (
            <li key={water.id}>
              <p>
                {new Date(water.date).toLocaleDateString()} - 
                Amount: {water.amount} ml
              </p>
              <button onClick={() => handleDeleteWater(water.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default FitnessTracker;