import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  getUserData, getDailyTasks, completeDailyTask, getAchievements
} from '../backend/achievement';

const AchievementContext = createContext();

export const useAchievement = () => useContext(AchievementContext);

export const AchievementProvider = ({ children }) => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setLoading(false);
        setError('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userData = await getUserData(userId);
      setUserPoints(userData.points || 0);

      const tasks = await getDailyTasks(userId);
      setDailyTasks(tasks);

      const userAchievements = await getAchievements(userId);
      setAchievements(userAchievements);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
      setLoading(false);
    }
  };

  const updateDailyTask = async (taskId) => {
    if (!auth.currentUser) return;

    try {
      const result = await completeDailyTask(auth.currentUser.uid, taskId);
      if (result.success) {
        // Update local state
        setDailyTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, lastCompleted: new Date(), streak: task.streak + 1 }
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

  return (
    <AchievementContext.Provider value={{ 
      dailyTasks, 
      achievements, 
      userPoints, 
      loading, 
      error, 
      updateDailyTask,
      fetchUserData 
    }}>
      {children}
    </AchievementContext.Provider>
  );
};