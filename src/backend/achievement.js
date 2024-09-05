// src/backend/achievement.js
import { db } from '../config/firebase';
import { doc,setDoc, getDoc } from 'firebase/firestore';

const predefinedAchievements = [
  { id: 'mood-master', title: "Mood Master", description: "Track your mood for 30 days", total: 30 },
  { id: 'fitness-fanatic', title: "Fitness Fanatic", description: "Complete 20 fitness exercises", total: 20 },
  { id: 'sleep-champion', title: "Sleep Champion", description: "Achieve 7+ hours of sleep for 14 nights", total: 14 },
  { id: 'calorie-conscious', title: "Calorie Conscious", description: "Track your calories for 30 days", total: 30 },
  { id: 'wellbeing-warrior', title: "Wellbeing Warrior", description: "Achieve higher than 70% wellbeing at least 5 times", total: 5 },
  { id: 'journaling-journey', title: "Journaling Journey", description: "Write in your diary for 30 days", total: 30 },
];

export const fetchAchievements = async (userId) => {
  try {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const userAchievementsDoc = await getDoc(userAchievementsRef);
    
    let userAchievements = userAchievementsDoc.exists() ? userAchievementsDoc.data() : {};

    return predefinedAchievements.map(achievement => ({
      ...achievement,
      progress: userAchievements[achievement.id] || 0
    }));
  } catch (error) {
    console.error("Error fetching achievements:", error);
    // Return predefined achievements with 0 progress if there's an error
    return predefinedAchievements.map(achievement => ({
      ...achievement,
      progress: 0
    }));
  }
};

export const updateAchievementProgress = async (userId, achievementId) => {
  try {
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const userAchievementsDoc = await getDoc(userAchievementsRef);
    
    let userAchievements = userAchievementsDoc.exists() ? userAchievementsDoc.data() : {};
    
    userAchievements[achievementId] = (userAchievements[achievementId] || 0) + 1;
    
    await setDoc(userAchievementsRef, userAchievements, { merge: true });
    
    return userAchievements[achievementId];
  } catch (error) {
    console.error("Error updating achievement progress:", error);
    // Return the predefined achievement with 0 progress if there's an error
    const achievement = predefinedAchievements.find(a => a.id === achievementId);
    return achievement ? { ...achievement, progress: 0 } : null;
  }
};

export const getAchievementDefinitions = () => {
  return predefinedAchievements;
};