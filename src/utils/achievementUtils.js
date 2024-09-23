import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { 
  getUserData, 
  getDailyTasks, 
  getAchievements, 
  completeDailyTask, 
  updateAchievementProgress, 
  initializeUserData,
  logNutrition,
  logWaterIntake as logWaterIntakeAPI,
  logMeditation,
  getRewards,
  redeemReward
} from '../backend/achievement';

const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const fetchUserData = useCallback(async (uid) => {
    if (!uid) return;
    
    setLoading(true);
    try {
      await initializeUserData(uid);
      const [userData, tasks, userAchievements, availableRewards] = await Promise.all([
        getUserData(uid),
        getDailyTasks(uid),
        getAchievements(uid),
        getRewards()
      ]);

      setUserPoints(userData.points || 0);
      setDailyTasks(tasks);
      setAchievements(userAchievements);
      setRewards(availableRewards);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid);
      } else {
        setUserId(null);
        setDailyTasks([]);
        setAchievements([]);
        setUserPoints(0);
        setRewards([]);
        setLoading(false);
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  const updateDailyTask = async (taskId) => {
    if (!userId) return { success: false, message: "User not authenticated" };

    try {
      const result = await completeDailyTask(userId, taskId);
      if (result.success) {
        setDailyTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? { ...task, lastCompleted: new Date(), streak: (task.streak || 0) + 1 }
              : task
          )
        );
        setUserPoints(prevPoints => prevPoints + (result.pointsEarned || 0));
        await fetchUserData(userId);
      }
      return result;
    } catch (err) {
      console.error("Error in updateDailyTask:", err);
      return { success: false, message: err.message || "Failed to complete task" };
    }
  };

  const updateExtendedTask = async (taskId) => {
    if (!userId) return { success: false, message: "User not authenticated" };

    try {
      const result = await updateAchievementProgress(userId, taskId, 1);
      if (result.success) {
        setAchievements(prevAchievements =>
          prevAchievements.map(achievement =>
            achievement.id === taskId
              ? { 
                  ...achievement, 
                  progress: Math.min(achievement.progress + 1, achievement.goal),
                  completed: achievement.progress + 1 >= achievement.goal
                }
              : achievement
          )
        );
        if (result.pointsEarned) {
          setUserPoints(prevPoints => prevPoints + result.pointsEarned);
        }
        await fetchUserData(userId);
      }
      return result;
    } catch (err) {
      console.error("Error updating extended task:", err);
      return { success: false, message: "Failed to update task" };
    }
  };

  const logNutritionData = async (nutritionData) => {
    if (!userId) return { success: false, message: "User not authenticated" };

    try {
      const result = await logNutrition(userId, nutritionData);
      if (result.success) {
        await fetchUserData(userId);
      }
      return result;
    } catch (err) {
      console.error("Error logging nutrition data:", err);
      return { success: false, message: "Failed to log nutrition data" };
    }
  };

  const logWaterIntake = async (waterIntakeData) => {
    if (!userId) return { success: false, message: "User not authenticated" };

    try {
      const result = await logWaterIntakeAPI(userId, waterIntakeData);
      if (result.success) {
        setAchievements(prevAchievements => 
          prevAchievements.map(achievement => 
            achievement.id === 'hydration-hero' 
              ? { ...achievement, progress: result.achievementUpdateResult.progress }
              : achievement
          )
        );
        setUserPoints(prevPoints => prevPoints + (result.pointsEarned || 0));
        await fetchUserData(userId);
      }
      return result;
    } catch (err) {
      console.error("Error logging water intake data:", err);
      return { success: false, message: "Failed to log water intake data" };
    }
  };

  const getAchievementProgress = (taskId) => {
    const achievement = achievements.find(a => a.id === taskId);
    return achievement ? achievement.progress : 0;
  };

  const redeemUserReward = async (rewardId) => {
    if (!userId) return { success: false, message: "User not authenticated" };

    try {
      const result = await redeemReward(userId, rewardId);
      if (result.success) {
        await fetchUserData(userId);
      }
      return result;
    } catch (err) {
      console.error("Error redeeming reward:", err);
      return { success: false, message: "Failed to redeem reward" };
    }
  };

  return (
    <AchievementContext.Provider 
      value={{
        dailyTasks,
        achievements,
        userPoints,
        rewards,
        loading,
        error,
        updateDailyTask,
        updateExtendedTask,
        getAchievementProgress,
        fetchUserData,
        logNutritionData,
        logWaterIntake,
        redeemUserReward
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievement = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievement must be used within an AchievementProvider');
  }
  return context;
};

export default AchievementProvider;