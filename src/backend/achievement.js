import { db } from '../config/firebase';
import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  getDocs, increment, arrayUnion, serverTimestamp,
  query, where, Timestamp, writeBatch
} from "firebase/firestore";

// Function to get user data
export const getUserData = async (userId) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.data();
};

// Function to get all achievements (aligned with extended tasks)
export const getAchievements = async (userId) => {
  const achievementsRef = collection(db, 'users', userId, 'extendedTasks');
  const achievementsSnapshot = await getDocs(achievementsRef);
  return achievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to update user's achievement progress
export const updateAchievementProgress = async (userId, achievementId, progress) => {
  const achievementRef = doc(db, 'users', userId, 'extendedTasks', achievementId);
  const userRef = doc(db, 'users', userId);

  const achievementDoc = await getDoc(achievementRef);
  const achievementData = achievementDoc.data();

  let currentProgress = achievementData.progress || 0;
  currentProgress += progress;

  if (currentProgress >= achievementData.goal) {
    // Achievement completed
    await updateDoc(achievementRef, {
      completedAt: serverTimestamp(),
      progress: achievementData.goal,
      completed: true
    });
    await updateDoc(userRef, {
      points: increment(achievementData.points),
      completedAchievements: arrayUnion(achievementId)
    });
    return { success: true, message: 'Achievement completed!', pointsEarned: achievementData.points };
  } else {
    // Update progress
    await updateDoc(achievementRef, {
      progress: currentProgress
    });
    return { success: true, message: 'Progress updated!' };
  }
};

// Function to get all rewards
export const getRewards = async () => {
  const rewardsRef = collection(db, 'rewards');
  const rewardsSnapshot = await getDocs(rewardsRef);
  return rewardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to redeem a reward
export const redeemReward = async (userId, rewardId) => {
  const userRef = doc(db, 'users', userId);
  const rewardRef = doc(db, 'rewards', rewardId);

  const userDoc = await getDoc(userRef);
  const rewardDoc = await getDoc(rewardRef);

  const userData = userDoc.data();
  const rewardData = rewardDoc.data();

  if (userData.points < rewardData.points) {
    throw new Error("Insufficient points");
  }

  // Generate a 12-digit voucher code
  const voucher = Math.random().toString(36).substring(2, 14).toUpperCase();

  // Create the reward object without the serverTimestamp
  const redeemedReward = {
    rewardId: rewardId,
    voucher: voucher
  };

  // Step 1: Update the points and add the redeemed reward (without timestamp)
  await updateDoc(userRef, {
    points: increment(-rewardData.points),
    redeemedRewards: arrayUnion(redeemedReward)
  });

  // Step 2: Update the document to add the serverTimestamp separately
  const updatedRewards = userData.redeemedRewards || []; // Get the existing rewards or empty array
  const updatedIndex = updatedRewards.length; // Index of the new reward in the array

  // Add the timestamp to the specific redeemed reward
  const updatedRewardPath = `redeemedRewards.${updatedIndex}.redeemedAt`; // Path to the new reward's timestamp
  await updateDoc(userRef, {
    [updatedRewardPath]: serverTimestamp()
  });

  return { success: true, voucher: voucher };
};

// Function to initialize daily tasks
export const initializeDailyTasks = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const dailyTasksRef = collection(userRef, 'dailyTasks');

  const defaultTasks = [
    { id: 'exercise', name: 'Fitness Fanatic', description: 'Log an exercise', icon: '💪', points: 5 },
    { id: 'sleep', name: 'Sleep Master', description: 'Log your sleep', icon: '😴', points: 5 },
    { id: 'meditation', name: 'Zen Master', description: 'Complete a meditation session', icon: '🧘', points: 5 },
    { id: 'journal', name: 'Reflective Writer', description: 'Write a journal entry', icon: '✍️', points: 5 },
  ];

  const batch = writeBatch(db);

  defaultTasks.forEach(task => {
    const taskRef = doc(dailyTasksRef, task.id);
    batch.set(taskRef, {
      ...task,
      lastCompleted: null,
      streak: 0,
    });
  });

  await batch.commit();
};

// Function to get daily tasks
export const getDailyTasks = async (userId) => {
  const dailyTasksRef = collection(db, 'users', userId, 'dailyTasks');
  const dailyTasksSnapshot = await getDocs(dailyTasksRef);
  return dailyTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to complete a daily task
export const completeDailyTask = async (userId, taskId) => {
  const userRef = doc(db, 'users', userId);
  const taskRef = doc(db, 'users', userId, 'dailyTasks', taskId);

  const taskDoc = await getDoc(taskRef);
  const taskData = taskDoc.data();

  const now = Timestamp.now();
  const lastCompleted = taskData.lastCompleted ? taskData.lastCompleted.toDate() : null;
  const isNewDay = !lastCompleted || lastCompleted.getDate() !== now.toDate().getDate();

  if (isNewDay) {
    await updateDoc(taskRef, {
      lastCompleted: now,
      streak: increment(1)
    });

    await updateDoc(userRef, {
      points: increment(taskData.points)
    });

    return { success: true, message: 'Task completed!', pointsEarned: taskData.points };
  } else {
    return { success: false, message: 'Task already completed today.' };
  }
};

// Function to initialize achievements (formerly extended tasks)
export const initializeAchievements = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const achievementsRef = collection(userRef, 'extendedTasks');

  const defaultAchievements = [
    { id: 'water', name: 'Hydration Hero', description: 'Log water intake', icon: '💧', points: 10, goal: 7, progress: 0 },
    { id: 'food', name: 'Nutrition Master', description: 'Log your food intake', icon: '🍎', points: 15, goal: 7, progress: 0 },
    { id: 'meditate_all', name: 'Zen Champion', description: 'Meditate all 4 sessions', icon: '🧘', points: 20, goal: 4, progress: 0 },
    { id: 'write_diary', name: 'Diary Devotee', description: 'Write in your diary for 7 days in a row', icon: '📖', points: 25, goal: 7, progress: 0 }
  ];

  const batch = writeBatch(db);

  defaultAchievements.forEach(achievement => {
    const achievementRef = doc(achievementsRef, achievement.id);
    batch.set(achievementRef, {
      ...achievement,
      lastUpdated: null,
      completed: false
    });
  });

  await batch.commit();
};

// Function to reset daily tasks (call this once a day, e.g., using a cloud function)
export const resetDailyTasks = async (userId) => {
  const dailyTasksRef = collection(db, 'users', userId, 'dailyTasks');
  const dailyTasksSnapshot = await getDocs(dailyTasksRef);

  const batch = writeBatch(db);

  dailyTasksSnapshot.docs.forEach(doc => {
    const taskData = doc.data();
    const lastCompleted = taskData.lastCompleted ? taskData.lastCompleted.toDate() : null;
    const now = new Date();

    if (!lastCompleted || lastCompleted.getDate() !== now.getDate()) {
      batch.update(doc.ref, { streak: 0 });
    }
  });

  await batch.commit();
};

// Function to ensure user has necessary data initialized
export const initializeUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Initialize user document if it doesn't exist
    await setDoc(userRef, {
      points: 0,
      completedAchievements: []
    });
  }

  // Check if daily tasks exist, if not initialize them
  const dailyTasksRef = collection(userRef, 'dailyTasks');
  const dailyTasksSnapshot = await getDocs(dailyTasksRef);
  if (dailyTasksSnapshot.empty) {
    await initializeDailyTasks(userId);
  }

  // Check if achievements (extended tasks) exist, if not initialize them
  const achievementsRef = collection(userRef, 'extendedTasks');
  const achievementsSnapshot = await getDocs(achievementsRef);
  if (achievementsSnapshot.empty) {
    await initializeAchievements(userId);
  }
};