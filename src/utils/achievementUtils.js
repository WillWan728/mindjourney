import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../config/firebase';
import { 
  getUserData, 
  getDailyTasks, 
  getAchievements, 
  completeDailyTask, 
  updateAchievementProgress, 
  initializeUserData
} from '../backend/achievement';

const AchievementContext = createContext();

export const useAchievement = () => useContext(AchievementContext);

export const AchievementProvider = ({ children }) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const fetchUserData = useCallback(async (uid) => {
    if (!uid) return;
    
    setLoading(true);
    try {
      console.log("Fetching user data for:", uid);
      
      // Initialize user data if necessary
      await initializeUserData(uid);

      const userData = await getUserData(uid);
      console.log("User data:", userData);
      setUserPoints(userData.points || 0);

      const tasks = await getDailyTasks(uid);
      console.log("Daily tasks:", tasks);
      setDailyTasks(tasks);

      const userAchievements = await getAchievements(uid);
      console.log("Achievements:", userAchievements);
      setAchievements(userAchievements);

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
      } else {
        setUserId(null);
        setDailyTasks([]);
        setAchievements([]);
        setUserPoints(0);
        setLoading(false);
        setError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId, fetchUserData]);

  const updateDailyTask = async (taskId) => {
    if (!userId) return;

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
        setUserPoints(prevPoints => prevPoints + result.pointsEarned);
      }
      return result;
    } catch (err) {
      console.error("Error completing daily task:", err);
      return { success: false, message: "Failed to complete task" };
    }
  };

  const updateExtendedTask = async (taskId) => {
    if (!userId) return;

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
      }
      return result;
    } catch (err) {
      console.error("Error updating extended task:", err);
      return { success: false, message: "Failed to update task" };
    }
  };

  return (
    <AchievementContext.Provider 
      value={{
        dailyTasks,
        achievements,
        userPoints,
        loading,
        error,
        updateDailyTask,
        updateExtendedTask,
        fetchUserData
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

export default AchievementProvider;