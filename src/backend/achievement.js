import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';

const ACHIEVEMENTS_COLLECTION = 'achievements';

export const createAchievement = async (userId, achievementData) => {
  try {
    console.log('Attempting to create achievement:', { userId, achievementData });
    const achievementsRef = collection(db, ACHIEVEMENTS_COLLECTION);
    const newAchievement = {
      userId,
      title: achievementData.title,
      description: achievementData.description,
      category: achievementData.category,
      date: Timestamp.fromDate(new Date(achievementData.date)),
      completed: achievementData.completed || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    console.log('Prepared achievement data:', newAchievement);
    const docRef = await addDoc(achievementsRef, newAchievement);
    console.log('Achievement created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding achievement: ", error);
    throw error;
  }
};

export const getAchievements = async (userId) => {
  try {
    console.log('Fetching achievements for user:', userId);
    const achievementsRef = collection(db, ACHIEVEMENTS_COLLECTION);
    const q = query(
      achievementsRef, 
      where("userId", "==", userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const achievements = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
    console.log('Fetched achievements:', achievements);
    return achievements;
  } catch (error) {
    console.error("Error getting achievements: ", error);
    throw error;
  }
};

export const updateAchievement = async (achievementId, updatedData) => {
  try {
    console.log('Updating achievement:', { achievementId, updatedData });
    const achievementRef = doc(db, ACHIEVEMENTS_COLLECTION, achievementId);
    const updateFields = {
      ...updatedData,
      updatedAt: Timestamp.now()
    };
    if (updatedData.date) updateFields.date = Timestamp.fromDate(new Date(updatedData.date));
    await updateDoc(achievementRef, updateFields);
    console.log('Achievement updated successfully');
  } catch (error) {
    console.error("Error updating achievement: ", error);
    throw error;
  }
};

export const deleteAchievement = async (achievementId) => {
  try {
    console.log('Deleting achievement:', achievementId);
    const achievementRef = doc(db, ACHIEVEMENTS_COLLECTION, achievementId);
    await deleteDoc(achievementRef);
    console.log('Achievement deleted successfully');
  } catch (error) {
    console.error("Error deleting achievement: ", error);
    throw error;
  }
};

export const getAchievementsByCategory = async (userId, category) => {
  try {
    console.log('Fetching achievements for user and category:', userId, category);
    const achievementsRef = collection(db, ACHIEVEMENTS_COLLECTION);
    const q = query(
      achievementsRef, 
      where("userId", "==", userId),
      where("category", "==", category),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const achievements = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
    console.log('Fetched achievements by category:', achievements);
    return achievements;
  } catch (error) {
    console.error("Error getting achievements by category: ", error);
    throw error;
  }
};