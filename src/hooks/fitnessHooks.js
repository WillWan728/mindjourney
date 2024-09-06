// src/hooks/useFitnessData.js
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';

const EXERCISE_COLLECTION = 'exercises';
const MEAL_COLLECTION = 'meals';
const WATER_COLLECTION = 'water';

export const useFitnessData = () => {
    const { user } = useAuth();
    const [exercises, setExercises] = useState([]);
    const [meals, setMeals] = useState([]);
    const [waterIntakes, setWaterIntakes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      if (user) {
        fetchData();
      } else {
        setLoading(false);
      }
    }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exercisesData, mealsData, waterData] = await Promise.all([
        fetchCollection(EXERCISE_COLLECTION),
        fetchCollection(MEAL_COLLECTION),
        fetchCollection(WATER_COLLECTION)
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

  const fetchCollection = async (collectionName) => {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  };

  const addExercise = async (exerciseData) => {
    try {
      setLoading(true);
      await addDoc(collection(db, EXERCISE_COLLECTION), {
        userId: user.uid,
        ...exerciseData,
        date: Timestamp.fromDate(new Date(exerciseData.date))
      });
      await fetchData();
    } catch (error) {
      console.error("Error submitting exercise: ", error);
      setError("Failed to add exercise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async (mealData) => {
    try {
      setLoading(true);
      await addDoc(collection(db, MEAL_COLLECTION), {
        userId: user.uid,
        ...mealData,
        date: Timestamp.fromDate(new Date(mealData.date))
      });
      await fetchData();
    } catch (error) {
      console.error("Error submitting meal: ", error);
      setError("Failed to add meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addWater = async (waterData) => {
    try {
      setLoading(true);
      await addDoc(collection(db, WATER_COLLECTION), {
        userId: user.uid,
        ...waterData,
        date: Timestamp.fromDate(new Date(waterData.date))
      });
      await fetchData();
    } catch (error) {
      console.error("Error submitting water intake: ", error);
      setError("Failed to add water intake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (exerciseId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, EXERCISE_COLLECTION, exerciseId));
      await fetchData();
    } catch (error) {
      console.error("Error deleting exercise: ", error);
      setError("Failed to delete exercise. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, MEAL_COLLECTION, mealId));
      await fetchData();
    } catch (error) {
      console.error("Error deleting meal: ", error);
      setError("Failed to delete meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteWater = async (waterId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, WATER_COLLECTION, waterId));
      await fetchData();
    } catch (error) {
      console.error("Error deleting water intake: ", error);
      setError("Failed to delete water intake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    exercises,
    meals,
    waterIntakes,
    loading,
    error,
    addExercise,
    addMeal,
    addWater,
    deleteExercise,
    deleteMeal,
    deleteWater
  };
};