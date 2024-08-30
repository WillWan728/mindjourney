// File: src/services/firebaseService.js

import { collection, addDoc, getDocs, query, where, Timestamp, orderBy,  deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const EXERCISE_COLLECTION = 'exercises';
const MEAL_COLLECTION = 'meals';

export const addExercise = async (exerciseData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, EXERCISE_COLLECTION), {
      userId: user.uid,
      type: exerciseData.type,
      duration: Number(exerciseData.duration),
      caloriesBurned: Number(exerciseData.caloriesBurned),
      date: Timestamp.fromDate(new Date(exerciseData.date)),
      distance: Number(exerciseData.distance) || 0,
      notes: exerciseData.notes || "",
      reps: Number(exerciseData.reps) || 0,
      sets: Number(exerciseData.sets) || 0,
      weight: Number(exerciseData.weight) || 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding exercise: ", error);
    throw error;
  }
};

export const fetchExercises = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    let q = query(
      collection(db, EXERCISE_COLLECTION),
      where('userId', '==', user.uid)
    );

    try {
      q = query(q, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
    } catch (indexError) {
      console.warn("Index not yet ready, fetching without ordering:", indexError);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
    }
  } catch (error) {
    console.error("Error fetching exercises: ", error);
    throw error;
  }
};

export const addMeal = async (mealData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, MEAL_COLLECTION), {
      userId: user.uid,
      name: mealData.name,
      calories: Number(mealData.calories),
      date: Timestamp.fromDate(new Date(mealData.date))
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding meal: ", error);
    throw error;
  }
};

export const fetchMeals = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    let q = query(
      collection(db, MEAL_COLLECTION),
      where('userId', '==', user.uid)
    );

    try {
      q = query(q, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
    } catch (indexError) {
      console.warn("Index not yet ready, fetching without ordering:", indexError);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));
    }
  } catch (error) {
    console.error("Error fetching meals: ", error);
    throw error;
  }
};

export const deleteExercise = async (exerciseId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
  
      await deleteDoc(doc(db, EXERCISE_COLLECTION, exerciseId));
    } catch (error) {
      console.error("Error deleting exercise: ", error);
      throw error;
    }
  };

  export const deleteMeal = async (mealId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
  
      await deleteDoc(doc(db, MEAL_COLLECTION, mealId));
    } catch (error) {
      console.error("Error deleting meal: ", error);
      throw error;
    }
  };