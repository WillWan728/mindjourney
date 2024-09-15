import { useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { 
  addExercise, 
  fetchExercises, 
  addMeal, 
  fetchMeals, 
  deleteExercise, 
  deleteMeal, 
  addWater, 
  fetchWater, 
  deleteWater,
  fetchWellbeingParams,
} from '../backend/fitness';

const useFitnessData = () => {
  const [user, setUser] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [meals, setMeals] = useState([]);
  const [waterIntakes, setWaterIntakes] = useState([]);
  const [exerciseForm, setExerciseForm] = useState({ 
    type: '', duration: '', caloriesBurned: '', date: '', 
    distance: '', sets: '', reps: '', weight: '', notes: '' 
  });
  const [mealForm, setMealForm] = useState({ 
    name: '', calories: '', date: '', description: '', 
    protein: '', carbs: '', fat: '', notes: '' 
  });
  const [waterForm, setWaterForm] = useState({ amount: '', date: '', time: '', type: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wellbeingParams, setWellbeingParams] = useState(null);
  const [currentExerciseMinutes, setCurrentExerciseMinutes] = useState(0);
  const [dailyCalories, setDailyCalories] = useState(0);

  const fetchData = useCallback(async () => {
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
  }, []);

  const fetchUserWellbeingParams = useCallback(async () => {
    try {
      const params = await fetchWellbeingParams();
      setWellbeingParams(params);
    } catch (error) {
      console.error("Error fetching wellbeing parameters: ", error);
      setError("Failed to load wellbeing parameters. Please try again later.");
    }
  }, []);

  const calculateCurrentExerciseMinutes = useCallback(() => {
    const currentDate = new Date();
    const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const totalMinutes = exercises.reduce((total, exercise) => {
      const exerciseDate = new Date(exercise.date);
      if (exerciseDate >= weekStart) {
        return total + parseInt(exercise.duration);
      }
      return total;
    }, 0);

    setCurrentExerciseMinutes(totalMinutes);
  }, [exercises]);

  const calculateDailyCalories = useCallback(() => {
    const currentDate = new Date().toDateString();
    const todayCalories = meals.reduce((total, meal) => {
      const mealDate = new Date(meal.date).toDateString();
      if (mealDate === currentDate) {
        return total + parseInt(meal.calories);
      }
      return total;
    }, 0);

    setDailyCalories(todayCalories);
  }, [meals]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchData();
        fetchUserWellbeingParams();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchData, fetchUserWellbeingParams]);

  useEffect(() => {
    calculateCurrentExerciseMinutes();
    calculateDailyCalories();
  }, [exercises, meals, calculateCurrentExerciseMinutes, calculateDailyCalories]);

  const handleExerciseSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await addExercise(exerciseForm);
      await fetchData();
      setExerciseForm({ 
        type: '', duration: '', caloriesBurned: '', date: '', 
        distance: '', sets: '', reps: '', weight: '', notes: '' 
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
        name: '', calories: '', date: '', description: '', 
        protein: '', carbs: '', fat: '', notes: '' 
      });
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
      setWaterForm({ amount: '', date: '', time: '', type: '', notes: '' });
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

  return {
    user,
    loading,
    error,
    exercises,
    meals,
    waterIntakes,
    exerciseForm,
    setExerciseForm,
    mealForm,
    setMealForm,
    waterForm,
    setWaterForm,
    wellbeingParams,
    currentExerciseMinutes,
    dailyCalories,
    handleExerciseSubmit,
    handleMealSubmit,
    handleWaterSubmit,
    handleDeleteExercise,
    handleDeleteMeal,
    handleDeleteWater,
  };
};

export default useFitnessData;