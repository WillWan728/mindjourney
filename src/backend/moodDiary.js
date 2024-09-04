import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveMood = async (userId, moodData) => {
  if (!userId) throw new Error('UserId is required');
  if (!moodData.mood) throw new Error('Mood is required');

  try {
    const moodsCollection = collection(db, 'moods');
    const docRef = await addDoc(moodsCollection, {
      userId: userId,
      mood: moodData.mood,
      factors: moodData.factors || [],
      diaryEntry: moodData.diaryEntry || '',
      diaryTitle: moodData.diaryTitle || '', 
      date: new Date() // Ensure date is a Firebase timestamp
    });
    console.log("Mood saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving mood: ", error);
    throw error;
  }
};

// Fetch all mood entries for a specific user, ordered by date in descending order
export const fetchMoods = async (userId) => {
  if (!userId) throw new Error('UserId is required');

  try {
    const moodsCollection = collection(db, 'moods');
    const moodsQuery = query(
      moodsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(moodsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate() // Convert Firestore Timestamp to JS Date
    }));
  } catch (error) {
    console.error("Error fetching moods: ", error);
    throw error;
  }
};

// Delete a mood entry from the Firestore database by its ID
export const deleteMood = async (moodId) => {
  if (!moodId) throw new Error('MoodId is required');

  try {
    await deleteDoc(doc(db, 'moods', moodId));
    console.log("Mood deleted with ID: ", moodId);
  } catch (error) {
    console.error("Error deleting mood: ", error);
    throw error;
  }
};
