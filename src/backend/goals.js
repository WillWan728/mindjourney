// src/backend/goals.js

import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const goalsCollection = collection(db, 'goals');

export const addGoal = async (userId, newGoal) => {
  const goalToAdd = {
    ...newGoal,
    userId,
    createdAt: new Date().toISOString(),
    completed: false
  };
  await addDoc(goalsCollection, goalToAdd);
};

export const updateGoal = async (goalId, updatedData) => {
  const goalRef = doc(db, 'goals', goalId);
  await updateDoc(goalRef, updatedData);
};

export const deleteGoal = async (goalId) => {
  const goalRef = doc(db, 'goals', goalId);
  await deleteDoc(goalRef);
};

export const getUserGoals = async (userId) => {
  const q = query(goalsCollection, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchGoals = async (userId) => {
  const q = query(
    goalsCollection,
    where("userId", "==", userId),
    where("completed", "==", false),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};