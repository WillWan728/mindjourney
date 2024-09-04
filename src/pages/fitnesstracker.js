import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { addExercise, fetchExercises, addMeal, fetchMeals, deleteExercise, deleteMeal, addWater, fetchWater, deleteWater } from '../backend/fitness';
import Navbar2 from './navbar2';
import ExerciseForm from './exerciseform';
import MealForm from './mealform';
import WaterForm from './waterform';
import History from './history';
import Overview from './overview';
import '../css/fitnesstracker.css';

const FitnessTracker = () => {
  const [user, setUser] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [waterIntakes, setWaterIntakes] = useState([]);
  const [exerciseForm, setExerciseForm] = useState({ /* initial state */ });
  const [mealForm, setMealForm] = useState({ /* initial state */ });
  const [waterForm, setWaterForm] = useState({ /* initial state */ });
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
      setExerciseForm({ /* reset form */ });
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
      setMealForm({ /* reset form */ });
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
      setWaterForm({ /* reset form */ });
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
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Fitness Overview
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'exercise' && (
            <ExerciseForm 
              exerciseForm={exerciseForm}
              setExerciseForm={setExerciseForm}
              handleExerciseSubmit={handleExerciseSubmit}
              loading={loading}
            />
          )}
          
          {activeTab === 'meal' && (
            <MealForm 
              mealForm={mealForm}
              setMealForm={setMealForm}
              handleMealSubmit={handleMealSubmit}
              loading={loading}
            />
          )}
          
          {activeTab === 'water' && (
            <WaterForm 
              waterForm={waterForm}
              setWaterForm={setWaterForm}
              handleWaterSubmit={handleWaterSubmit}
              loading={loading}
            />
          )}
          
          {activeTab === 'history' && (
            <History 
              exercises={exercises}
              meals={meals}
              waterIntakes={waterIntakes}
              handleDeleteExercise={handleDeleteExercise}
              handleDeleteMeal={handleDeleteMeal}
              handleDeleteWater={handleDeleteWater}
            />
          )}
          
          {activeTab === 'overview' && (
            <Overview 
              exercises={exercises}
              meals={meals}
              waterIntakes={waterIntakes}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default FitnessTracker;