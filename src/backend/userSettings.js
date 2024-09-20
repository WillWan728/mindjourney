import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COMPONENT_WEIGHTS } from '../utils/wellbeingUtils';

export const fetchUserSettings = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  
  const userSettingsRef = doc(db, 'userSettings', userId);
  const userSettingsSnap = await getDoc(userSettingsRef);
  
  if (userSettingsSnap.exists()) {
    const data = userSettingsSnap.data();
    return {
      ...data,
      componentWeights: data.componentWeights || COMPONENT_WEIGHTS
    };
  } else {
    return { componentWeights: COMPONENT_WEIGHTS };
  }
};

export const saveUserSettings = async (userId, settings) => {
  if (!userId) throw new Error('User ID is required');
  
  const userSettingsRef = doc(db, 'userSettings', userId);
  
  if (settings.componentWeights) {
    const totalWeight = Object.values(settings.componentWeights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      throw new Error('Component weights must sum to 100');
    }
  }

  try {
    await setDoc(userSettingsRef, settings, { merge: true });
    console.log("User settings saved successfully:", settings);
  } catch (error) {
    console.error("Error saving user settings:", error);
    throw error;
  }
};

export const resetComponentWeights = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  const userSettingsRef = doc(db, 'userSettings', userId);
  try {
    await setDoc(userSettingsRef, { componentWeights: COMPONENT_WEIGHTS }, { merge: true });
    console.log("Weights reset and saved to:", COMPONENT_WEIGHTS);
    return COMPONENT_WEIGHTS;
  } catch (error) {
    console.error("Error resetting and saving component weights:", error);
    throw error;
  }
};

export { COMPONENT_WEIGHTS as DEFAULT_COMPONENT_WEIGHTS };