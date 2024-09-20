import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,  
  deleteDoc, 
  doc,
  limit,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const EXERCISE_COLLECTION = 'exercises';
const MEAL_COLLECTION = 'meals';
const WATER_COLLECTION = 'water';
const WELLBEING_COLLECTION = 'wellbeing';

// Exercise Functions
export const addExercise = async (exerciseData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const exerciseToAdd = {
      userId: user.uid,
      type: exerciseData.type,
      duration: Number(exerciseData.duration),
      caloriesBurned: parseInt(exerciseData.caloriesBurned, 10),
      date: Timestamp.fromDate(new Date(exerciseData.date)),
      distance: Number(exerciseData.distance) || 0,
      notes: exerciseData.notes || ""
    };

    const docRef = await addDoc(collection(db, EXERCISE_COLLECTION), exerciseToAdd);
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

    const exercisesRef = collection(db, 'exercises');
    const q = query(
      exercisesRef,
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(50)  
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date instanceof Date ? data.date : data.date.toDate()
      };
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
};

export const deleteExercise = async (exerciseId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const exerciseRef = doc(db, EXERCISE_COLLECTION, exerciseId);
    const exerciseDoc = await getDoc(exerciseRef);

    if (!exerciseDoc.exists()) {
      throw new Error("Exercise not found");
    }

    if (exerciseDoc.data().userId !== user.uid) {
      throw new Error("Not authorized to delete this exercise");
    }

    await deleteDoc(exerciseRef);
  } catch (error) {
    console.error("Error deleting exercise: ", error);
    throw error;
  }
};

// Meal Functions
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

    const q = query(
      collection(db, MEAL_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  } catch (error) {
    console.error("Error fetching meals: ", error);
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

// Water Functions
export const addWater = async (waterData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const docRef = await addDoc(collection(db, WATER_COLLECTION), {
      userId: user.uid,
      amount: Number(waterData.amount),
      date: Timestamp.fromDate(new Date(waterData.date))
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding water intake: ", error);
    throw error;
  }
};

export const fetchWater = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, WATER_COLLECTION),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  } catch (error) {
    console.error("Error fetching water intake: ", error);
    throw error;
  }
};

export const deleteWater = async (waterId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await deleteDoc(doc(db, WATER_COLLECTION, waterId));
  } catch (error) {
    console.error("Error deleting water intake: ", error);
    throw error;
  }
};

// Wellbeing Functions
export const fetchWellbeingParams = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, WELLBEING_COLLECTION, user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Return default values if no document exists
      return {
        weeklyExerciseMinutes: 150, // WHO recommendation
        dailyCalorieTarget: 2000 // General recommendation, should be personalized
      };
    }
  } catch (error) {
    console.error("Error fetching wellbeing parameters: ", error);
    throw error;
  }
};

export const updateWellbeingParams = async (params) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, WELLBEING_COLLECTION, user.uid);
    await setDoc(docRef, params, { merge: true });
    console.log("Wellbeing parameters updated successfully");
  } catch (error) {
    console.error("Error updating wellbeing parameters: ", error);
    throw error;
  }
};

// Utility Functions
export const calculateTotalCaloriesBurned = async (startDate, endDate) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(
      collection(db, EXERCISE_COLLECTION),
      where('userId', '==', user.uid),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce((total, doc) => total + doc.data().caloriesBurned, 0);
  } catch (error) {
    console.error("Error calculating total calories burned: ", error);
    throw error;
  }
};

export const getExerciseStats = async (exerciseType, startDate, endDate) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(
      collection(db, EXERCISE_COLLECTION),
      where('userId', '==', user.uid),
      where('type', '==', exerciseType),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    const exercises = querySnapshot.docs.map(doc => doc.data());

    return {
      totalDuration: exercises.reduce((total, ex) => total + ex.duration, 0),
      totalCaloriesBurned: exercises.reduce((total, ex) => total + ex.caloriesBurned, 0),
      averageCaloriesPerMinute: exercises.length ? 
        exercises.reduce((total, ex) => total + ex.caloriesBurned, 0) / exercises.reduce((total, ex) => total + ex.duration, 0) : 0,
      count: exercises.length
    };
  } catch (error) {
    console.error("Error getting exercise stats: ", error);
    throw error;
  }
};