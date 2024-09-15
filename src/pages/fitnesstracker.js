import React, { useState } from 'react';
import { auth } from '../config/firebase';
import Navbar2 from './navbar2';
import ExerciseForm from './fitness/ExerciseForm';
import MealForm from './fitness/MealForm';
import WaterForm from './fitness/WaterForm';
import History from './fitness/HistoryForm';
import useFitnessData from '../hooks/fitnessHooks';
import '../css/fitnesstracker.css';

const FitnessTracker = () => {
  const [activeTab, setActiveTab] = useState('exercise');
  const {
    user,
    loading,
    error,
    exercises,
    meals,
    waterIntakes,
    wellbeingParams,
    currentExerciseMinutes,
    dailyCalories,
    exerciseForm,
    setExerciseForm,
    mealForm,
    setMealForm,
    waterForm,
    setWaterForm,
    handleExerciseSubmit,
    handleMealSubmit,
    handleWaterSubmit,
    handleDeleteExercise,
    handleDeleteMeal,
    handleDeleteWater
  } = useFitnessData();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to access the Fitness Tracker.</div>;

  return (
    <>
      <Navbar2 />
      <div className="fitness-tracker-container">
        <h1 className="main-title">Fitness Tracker</h1>
        {error && <div className="error-message">{error}</div>}
        
        {wellbeingParams && (
          <div className="fitness-goals">
            <p>Weekly Exercise: {currentExerciseMinutes} / {wellbeingParams.weeklyExerciseMinutes} minutes</p>
            <p>Daily Calories: {dailyCalories} / {wellbeingParams.dailyCalorieTarget} calories</p>
            <p></p>
          </div>
        )}

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
        </div>
      </div>
    </>
  );
};

export default FitnessTracker;