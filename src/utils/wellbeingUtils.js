import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const COMPONENT_WEIGHTS = {
  fitness: 25,
  sleep: 25,
  mood: 25,
  meditation: 25
};

const calculateFitnessScore = (exercises, goals) => {
  console.log('Calculating fitness score:', { exercises, goals });
  if (!goals || !goals.weeklyExerciseMinutes || exercises.length === 0) return 0;
  
  const currentDate = new Date();
  const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
  weekStart.setHours(0, 0, 0, 0);

  const totalMinutes = exercises.reduce((total, exercise) => {
    const exerciseDate = new Date(exercise.date);
    if (exerciseDate >= weekStart) {
      return total + parseInt(exercise.duration);
    }
    return total;
  }, 0);

  console.log('Total exercise minutes this week:', totalMinutes);
  const percentageCompleted = (totalMinutes / Number(goals.weeklyExerciseMinutes)) * 100;
  console.log('Percentage completed:', percentageCompleted);
  return Math.min(100, percentageCompleted);
};

const calculateSleepScore = (sleepLogs, goals) => {
  console.log('Calculating sleep score:', { sleepLogs, goals });
  if (!goals || !goals.sleepHoursPerNight || sleepLogs.length === 0) return 0;
  
  const averageSleepHours = sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length;
  const percentageAchieved = (averageSleepHours / Number(goals.sleepHoursPerNight)) * 100;
  return Math.min(100, percentageAchieved);
};

const calculateMoodScore = (moods) => {
  console.log('Calculating mood score:', { moods });
  if (moods.length === 0) return 0;
  
  const moodValues = { 'angry': 1, 'stressed': 2, 'sad': 3, 'okay': 3, 'calm': 4, 'happy': 5 };
  const averageMood = moods.reduce((sum, mood) => sum + (moodValues[mood.value] || 3), 0) / moods.length;
  return ((averageMood - 1) / 4) * 100;
};

const calculateMeditationScore = (meditations, goals) => {
  console.log('Calculating meditation score:', { meditations, goals });
  if (!goals || !goals.weeklyMeditationMinutes || meditations.length === 0) return 0;
  
  const totalMinutes = meditations.reduce((sum, meditation) => sum + meditation.duration, 0);
  const percentageCompleted = (totalMinutes / Number(goals.weeklyMeditationMinutes)) * 100;
  return Math.min(100, percentageCompleted);
};

export const calculateOverallWellbeingScore = (componentScores) => {
  const totalWeight = Object.values(COMPONENT_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  const weightedScore = Object.entries(componentScores).reduce((sum, [component, score]) => {
    return sum + (score * (COMPONENT_WEIGHTS[component] / totalWeight));
  }, 0);
  return Math.round(weightedScore);
};

export const getScoreCategory = (score) => {
  if (score < 33) return 'low';
  if (score < 66) return 'medium';
  return 'high';
};

export const getComponentEmoji = (component) => {
  const emojiMap = {
    fitness: "💪",
    sleep: "😴",
    mood: "😊",
    meditation: "🧘"
  };
  return emojiMap[component] || "❓";
};

export const getAdvice = (component, score) => {
  const category = getScoreCategory(score);
  const adviceMap = {
    fitness: {
      low: "Try to increase your exercise time gradually. Start with activities you enjoy, even if it's just a short walk.",
      medium: "You're doing well! Consider adding variety to your workouts to keep improving and stay motivated.",
      high: "Excellent job! Maintain your diverse exercise routine and consider new fitness challenges to keep pushing yourself."
    },
    sleep: {
      low: "Focus on establishing a consistent sleep schedule and creating a relaxing bedtime routine.",
      medium: "You're on the right track. Try to optimize your sleep environment for better quality rest.",
      high: "Great sleep habits! Fine-tune your routine to maintain this excellent pattern."
    },
    mood: {
      low: "Practice daily gratitude and consider talking to someone about your feelings.",
      medium: "You're managing well. Try incorporating more activities you enjoy into your routine.",
      high: "Fantastic emotional well-being! Keep up the positivity and share it with others."
    },
    meditation: {
      low: "Start with short, guided meditations to build your practice.",
      medium: "You're developing a good habit. Experiment with different meditation techniques.",
      high: "Impressive meditation practice! Consider longer sessions or a meditation retreat."
    }
  };
  return adviceMap[component][category] || "Keep working on improving this aspect of your wellbeing.";
};

export const calculateWellbeingScore = async (userId, fitnessData) => {
  try {
    console.log('Starting wellbeing score calculation for user:', userId);
    console.log('Fitness data received:', fitnessData);
    
    const { exercises, meals, waterIntakes, wellbeingParams } = fitnessData;

    // Use wellbeingParams as goals
    const goals = wellbeingParams;

    console.log('Debug - Using wellbeing params as goals:', goals);

    // Calculate component scores
    const componentScores = {
      fitness: calculateFitnessScore(exercises, goals),
      sleep: calculateSleepScore(exercises.filter(e => e.type === 'sleep'), goals),
      mood: calculateMoodScore(exercises.filter(e => e.type === 'mood')),
      meditation: calculateMeditationScore(exercises.filter(e => e.type === 'meditation'), goals)
    };

    console.log('Debug - Component scores:', componentScores);

    const overallScore = calculateOverallWellbeingScore(componentScores);

    console.log('Debug - Overall wellbeing score:', overallScore);

    return {
      overallScore,
      componentScores,
      goals,
      recentActivities: {
        exercises: exercises.slice(-5),
        meals: meals.slice(-5),
        waterIntakes: waterIntakes.slice(-5)
      }
    };
  } catch (error) {
    console.error('Error calculating wellbeing score:', error);
    throw error;
  }
};