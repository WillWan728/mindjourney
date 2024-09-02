import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar2 from './navbar2';
import '../css/fitnesstracker.css';
import { addExercise, fetchExercises, addMeal, fetchMeals, deleteExercise, deleteMeal } from '../backend/fitness';
import { auth } from '../config/firebase';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FitnessTracker = () => {
  const [user, setUser] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [exerciseForm, setExerciseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    duration: '',
    caloriesBurned: '',
    distance: '',
    notes: '',
    reps: '',
    sets: '',
    weight: ''
  });
  const [mealForm, setMealForm] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    calories: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullExerciseHistory, setShowFullExerciseHistory] = useState(false);
  const [showFullMealHistory, setShowFullMealHistory] = useState(false);

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
      const [exercisesData, mealsData] = await Promise.all([fetchExercises(), fetchMeals()]);
      setExercises(exercisesData);
      setMeals(mealsData);
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
      setExerciseForm({
        ...exerciseForm,
        type: '',
        duration: '',
        caloriesBurned: '',
        distance: '',
        notes: '',
        reps: '',
        sets: '',
        weight: ''
      });
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
      setMealForm({
        ...mealForm,
        name: '',
        calories: ''
      });
    } catch (error) {
      console.error("Error submitting meal: ", error);
      setError("Failed to add meal. Please try again.");
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

  const renderChart = () => {
    const sortedData = [...meals, ...exercises].sort((a, b) => a.date - b.date);
  
    const data = {
      labels: sortedData.map(item => item.date.toLocaleDateString()),
      datasets: [
        {
          label: 'Calories Consumed',
          data: sortedData.map(item => item.calories || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          pointRadius: 5,
          pointHoverRadius: 8,
          fill: false,
        },
        {
          label: 'Calories Burned',
          data: sortedData.map(item => item.caloriesBurned || 0),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          pointRadius: 5,
          pointHoverRadius: 8,
          fill: false,
        }
      ]
    };
  
    const options = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { 
          display: true, 
          text: 'Calorie Intake and Burned' 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              const dataPoint = sortedData[context.dataIndex];
              if (dataPoint.type) {
                label += ` (${dataPoint.type})`;
              } else if (dataPoint.name) {
                label += ` (${dataPoint.name})`;
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Calories'
          },
          beginAtZero: true
        }
      }
    };
  
    return <Line data={data} options={options} />;
  };

  const renderExerciseList = () => {
    const exercisesToShow = showFullExerciseHistory ? exercises : exercises.slice(0, 3);
    return (
      <>
        <ul className="log-list">
          {exercisesToShow.map((exercise, index) => (
            <li key={index}>
              {exercise.date.toLocaleDateString()}: {exercise.type} for {exercise.duration} minutes, 
              burned {exercise.caloriesBurned} calories
              {exercise.distance > 0 && `, distance: ${exercise.distance}`}
              {exercise.sets > 0 && `, sets: ${exercise.sets}`}
              {exercise.reps > 0 && `, reps: ${exercise.reps}`}
              {exercise.weight > 0 && `, weight: ${exercise.weight}`}
              {exercise.notes && `, notes: ${exercise.notes}`}
              <button onClick={() => handleDeleteExercise(exercise.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
        {exercises.length > 3 && (
          <button 
            onClick={() => setShowFullExerciseHistory(!showFullExerciseHistory)} 
            className="history-button"
          >
            {showFullExerciseHistory ? "Show Less" : "View Full History"}
          </button>
        )}
      </>
    );
  };

  const renderMealList = () => {
    const mealsToShow = showFullMealHistory ? meals : meals.slice(0, 3);
    return (
      <>
        <ul className="log-list">
          {mealsToShow.map((meal, index) => (
            <li key={index}>
              {meal.date.toLocaleDateString()}: {meal.name} - {meal.calories} calories
              <button onClick={() => handleDeleteMeal(meal.id)} className="delete-button">Delete</button>
            </li>
          ))}
        </ul>
        {meals.length > 3 && (
          <button 
            onClick={() => setShowFullMealHistory(!showFullMealHistory)} 
            className="history-button"
          >
            {showFullMealHistory ? "Show Less" : "View Full History"}
          </button>
        )}
      </>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access the Fitness Tracker.</div>;
  }

  return (
    <div className="fitness-tracker">
      <Navbar2 />
      <h1 className="page-title">Fitness Tracker</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="content-grid">
        <div className="feature-card exercise-log">
          <h2>Exercise Log</h2>
          <form onSubmit={handleExerciseSubmit} className="tracker-form">
            <input 
              type="date" 
              value={exerciseForm.date} 
              onChange={(e) => setExerciseForm({...exerciseForm, date: e.target.value})} 
              required 
            />
            <input 
              type="text" 
              value={exerciseForm.type} 
              onChange={(e) => setExerciseForm({...exerciseForm, type: e.target.value})} 
              placeholder="Exercise Type" 
              required 
            />
            <input 
              type="number" 
              value={exerciseForm.duration} 
              onChange={(e) => setExerciseForm({...exerciseForm, duration: e.target.value})} 
              placeholder="Duration (minutes)" 
              required 
            />
            <input 
              type="number" 
              value={exerciseForm.caloriesBurned} 
              onChange={(e) => setExerciseForm({...exerciseForm, caloriesBurned: e.target.value})} 
              placeholder="Calories Burned" 
              required 
            />
            <input 
              type="number" 
              value={exerciseForm.distance} 
              onChange={(e) => setExerciseForm({...exerciseForm, distance: e.target.value})} 
              placeholder="Distance" 
            />
            <input 
              type="number" 
              value={exerciseForm.sets} 
              onChange={(e) => setExerciseForm({...exerciseForm, sets: e.target.value})} 
              placeholder="Sets" 
            />
            <input 
              type="number" 
              value={exerciseForm.reps} 
              onChange={(e) => setExerciseForm({...exerciseForm, reps: e.target.value})} 
              placeholder="Reps" 
            />
            <input 
              type="number" 
              value={exerciseForm.weight} 
              onChange={(e) => setExerciseForm({...exerciseForm, weight: e.target.value})} 
              placeholder="Weight" 
            />
            <textarea 
              value={exerciseForm.notes} 
              onChange={(e) => setExerciseForm({...exerciseForm, notes: e.target.value})} 
              placeholder="Notes" 
            />
            <button type="submit" className="submit-button" disabled={loading}>Add Exercise</button>
          </form>
          {renderExerciseList()}
        </div>
        
        <div className="feature-card calorie-tracker">
          <h2>Nutrition Log</h2>
          <form onSubmit={handleMealSubmit} className="tracker-form">
            <input 
              type="date" 
              value={mealForm.date} 
              onChange={(e) => setMealForm({...mealForm, date: e.target.value})} 
              required 
            />
            <input 
              type="text" 
              value={mealForm.name} 
              onChange={(e) => setMealForm({...mealForm, name: e.target.value})} 
              placeholder="Meal Name" 
              required 
            />
            <input 
              type="number" 
              value={mealForm.calories} 
              onChange={(e) => setMealForm({...mealForm, calories: e.target.value})} 
              placeholder="Calories" 
              required 
            />
            <button type="submit" className="submit-button" disabled={loading}>Add Meal</button>
          </form>
          {renderMealList()}
        </div>
        
        <div className="feature-card calories-overview">
          <h2>Calorie Overview</h2>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default FitnessTracker;