// src/utils/achievementUtils.js

import { auth } from '../config/firebase';
import { 
  updateAchievementProgress, 
  fetchAchievements
} from '../backend/achievement';

// Update a single achievement
export const updateAchievement = async (achievementId) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const newProgress = await updateAchievementProgress(user.uid, achievementId);
      console.log(`Achievement ${achievementId} updated. New progress: ${newProgress}`);
      return newProgress;
    } else {
      console.error("No user logged in");
      return null;
    }
  } catch (error) {
    console.error(`Error updating achievement ${achievementId}:`, error);
    return null;
  }
};

// Refresh all achievements for the current user
export const refreshAchievements = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const achievements = await fetchAchievements(user.uid);
      console.log("Achievements refreshed:", achievements);
      return achievements;
    } else {
      console.error("No user logged in");
      return [];
    }
  } catch (error) {
    console.error("Error refreshing achievements:", error);
    return [];
  }
};

// Get all achievement definitions
export const getAchievements = async () => {
  // Since we don't have getAchievementDefinitions, we'll use fetchAchievements instead
  // This assumes that fetchAchievements returns the full achievement data including definitions
  try {
    const user = auth.currentUser;
    if (user) {
      const achievements = await fetchAchievements(user.uid);
      console.log("Achievements fetched:", achievements);
      return achievements;
    } else {
      console.error("No user logged in");
      return [];
    }
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }
};

// Check if an achievement is completed
export const isAchievementCompleted = (achievement) => {
  return achievement.progress >= achievement.total;
};

// Calculate the percentage completion of an achievement
export const calculateAchievementPercentage = (achievement) => {
  return Math.min((achievement.progress / achievement.total) * 100, 100);
};

// Update multiple achievements at once
export const updateMultipleAchievements = async (achievementIds) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const updatePromises = achievementIds.map(id => updateAchievementProgress(user.uid, id));
      const results = await Promise.all(updatePromises);
      console.log("Multiple achievements updated:", results);
      return results;
    } else {
      console.error("No user logged in");
      return null;
    }
  } catch (error) {
    console.error("Error updating multiple achievements:", error);
    return null;
  }
};

// Get a specific achievement by ID
export const getAchievementById = async (achievementId) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const achievements = await fetchAchievements(user.uid);
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        console.log("Achievement found:", achievement);
        return achievement;
      } else {
        console.error("Achievement not found");
        return null;
      }
    } else {
      console.error("No user logged in");
      return null;
    }
  } catch (error) {
    console.error(`Error fetching achievement ${achievementId}:`, error);
    return null;
  }
};

// Helper function to trigger achievement updates based on user actions
export const triggerAchievementCheck = async (action, value = 1) => {
  const actionAchievementMap = {
    'journal_entry': 'journaling-journey',
    'exercise_completed': 'fitness-fanatic',
    'sleep_logged': 'sleep-champion',
    'mood_tracked': 'mood-master',
    'calories_logged': 'calorie-conscious',
    'wellbeing_score': 'wellbeing-warrior',
  };

  const achievementId = actionAchievementMap[action];
  if (achievementId) {
    if (action === 'wellbeing_score' && value > 70) {
      await updateAchievement(achievementId);
    } else if (action !== 'wellbeing_score') {
      await updateAchievement(achievementId);
    }
  }
};