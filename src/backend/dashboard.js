// src/backend/dashboard.js

import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { calculateOverallWellbeingScore } from './scoreCalculation';

const emotionToEmojiMap = {
  "Happy": "😊",
  "Excited": "🤩",
  "Calm": "😌",
  "Content": "🙂",
  "Okay": "😐",
  "Tired": "😴",
  "Stressed": "😩",
  "Anxious": "😰",
  "Sad": "😢",
  "Angry": "😠"
  // Add more emotions and corresponding emojis as needed
};

export const getDashboardData = async (userId) => {
  if (!userId) {
    console.error('User ID is undefined');
    throw new Error('User ID is required');
  }

  try {
    // Fetch sleep logs
    const sleepLogsQuery = query(
      collection(db, 'sleep'),
      where('userId', '==', userId)
    );
    const sleepLogsSnapshot = await getDocs(sleepLogsQuery);
    const sleepLogs = sleepLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch exercises
    const exercisesQuery = query(
      collection(db, 'exercises'),
      where('userId', '==', userId)
    );
    const exercisesSnapshot = await getDocs(exercisesQuery);
    const exercises = exercisesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch moods
    const moodsQuery = query(
      collection(db, 'moods'),
      where('userId', '==', userId)
    );
    const moodsSnapshot = await getDocs(moodsQuery);
    const moods = moodsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch meditations
    const meditationsQuery = query(
      collection(db, 'meditations'),
      where('userId', '==', userId)
    );
    const meditationsSnapshot = await getDocs(meditationsQuery);
    const meditations = meditationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch goals (assuming you want the most recent active goal)
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('completed', '==', false)
    );
    const goalsSnapshot = await getDocs(goalsQuery);
    const goals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate component data
    const sleepData = calculateSleepData(sleepLogs);
    const fitnessData = calculateFitnessData(exercises);
    const moodData = calculateMoodData(moods);
    const meditationData = calculateMeditationData(meditations);

    // Calculate component scores
    const componentScores = {
      sleep: sleepData.score,
      fitness: fitnessData.score,
      mood: moodData.score,
      meditation: meditationData.score
    };

    // Calculate overall wellbeing score
    const wellbeingScore = calculateOverallWellbeingScore(componentScores);

    return {
      wellbeingScore: Math.round(wellbeingScore),
      componentScores,
      sleep: sleepData,
      fitness: fitnessData,
      mood: moodData,
      meditation: meditationData,
      goals: goals.length > 0 ? goals[0] : null
    };
  } catch (error) {
    console.error('Specific error in getDashboardData:', error.code, error.message);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check authentication and data ownership.');
    } else {
      throw new Error('Failed to fetch dashboard data: ' + error.message);
    }
  }
};

const calculateSleepData = (sleepLogs) => {
  if (sleepLogs.length === 0) return { averageDuration: null, averageQuality: null, score: 0 };
  
  let totalDuration = 0;
  let totalQuality = 0;
  let validLogs = 0;

  sleepLogs.forEach(log => {
    if (log.duration && !isNaN(log.duration)) {
      totalDuration += log.duration;
      totalQuality += log.sleepQuality || 0;
      validLogs++;
    }
  });

  const averageDuration = validLogs > 0 ? totalDuration / validLogs : 0;
  const averageQuality = validLogs > 0 ? totalQuality / validLogs : 0;

  return {
    averageDuration: {
      hours: averageDuration,
      formatted: formatDuration(averageDuration)
    },
    averageQuality: parseFloat(averageQuality.toFixed(1)),
    score: validLogs > 0 ? 100 : 0  // Full score if there are any valid logs
  };
};

const calculateFitnessData = (exercises) => {
  const totalCalories = exercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0);
  const totalDuration = exercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);

  return {
    totalCaloriesBurned: totalCalories,
    totalExerciseDuration: {
      minutes: totalDuration,
      formatted: formatDuration(totalDuration / 60)
    },
    score: exercises.length > 0 ? 100 : 0  // Full score if there are any exercises
  };
};

const calculateMoodData = (moods) => {
  console.log('Raw mood data:', moods); // Log raw mood data

  // Sort moods by date, most recent first
  const sortedMoods = moods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  let latestMood = 'Not logged yet';
  if (sortedMoods.length > 0) {
    const latest = sortedMoods[0];
    console.log('Latest mood entry:', latest); // Log the latest mood entry

    if (latest.mood) {
      const emoji = emotionToEmojiMap[latest.mood] || '😶'; // Use a neutral face if mood doesn't match any in the map
      latestMood = `${latest.mood} ${emoji}`;
    } else {
      latestMood = 'Mood data incomplete';
      console.warn('Incomplete mood data:', latest);
    }
  }

  return {
    totalEntries: moods.length,
    latestMood: latestMood,
    score: moods.length > 0 ? 100 : 0
  };
};

const calculateMeditationData = (meditations) => {
  const totalSessions = meditations.length;
  const totalDuration = meditations.reduce((sum, meditation) => sum + (meditation.duration || 0), 0);

  return {
    completedSessions: totalSessions,
    totalMinutes: totalDuration,
    score: totalSessions > 0 ? 100 : 0  // Full score if there are any meditation sessions
  };
};

const formatDuration = (hours) => {
  if (isNaN(hours) || hours === null) return 'No data';
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};