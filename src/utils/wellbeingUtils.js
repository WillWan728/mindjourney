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
  
  const currentDate = new Date();
  const weekStart = new Date(currentDate.setDate(currentDate.getDate() - 7)); // Last 7 days

  const recentLogs = sleepLogs.filter(log => new Date(log.date) >= weekStart);
  
  const avgSleepDuration = recentLogs.reduce((sum, log) => {
    const bedtime = new Date(log.bedtime);
    const waketime = new Date(log.waketime);
    let duration = (waketime - bedtime) / (1000 * 60 * 60); // in hours
    if (duration < 0) duration += 24; // Adjust for sleep past midnight
    return sum + duration;
  }, 0) / recentLogs.length;

  const avgQuality = recentLogs.reduce((sum, log) => sum + log.quality, 0) / recentLogs.length;

  const durationScore = (avgSleepDuration / Number(goals.sleepHoursPerNight)) * 100;
  const qualityScore = (avgQuality / 10) * 100; // Assuming quality is on a scale of 1-10

  const overallSleepScore = (durationScore * 0.7) + (qualityScore * 0.3); // Weighting duration more than quality

  console.log('Sleep score components:', { avgSleepDuration, avgQuality, durationScore, qualityScore, overallSleepScore });
  return Math.min(100, overallSleepScore);
};

const calculateMeditationScore = (totalMeditationMinutes, streak, averageDuration, goals) => {
  console.log('Calculating meditation score:', { totalMeditationMinutes, streak, averageDuration, goals });
  if (!goals || !goals.weeklyMeditationMinutes) return 0;
  
  const minutesScore = Math.min(100, (totalMeditationMinutes / goals.weeklyMeditationMinutes) * 100);
  const streakScore = Math.min(100, streak * 10); // 10 points per day, max 100
  const durationScore = Math.min(100, (averageDuration / 20) * 100); // Assuming 20 minutes is a good average duration
  
  // Weighting the scores (adjust as needed)
  const overallMeditationScore = (minutesScore * 0.5) + (streakScore * 0.3) + (durationScore * 0.2);
  
  console.log('Meditation score components:', { minutesScore, streakScore, durationScore, overallMeditationScore });
  return Math.min(100, overallMeditationScore);
};

export const calculateOverallWellbeingScore = (componentScores, weights) => {
  console.log('Calculating overall wellbeing score with weights:', weights);
  console.log('Component scores:', componentScores);
  
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  console.log('Total weight:', totalWeight);
  
  const weightedScore = Object.entries(componentScores).reduce((sum, [component, score]) => {
    const weightedComponentScore = score * (weights[component] / totalWeight);
    console.log(`${component} weighted score:`, weightedComponentScore);
    return sum + weightedComponentScore;
  }, 0);
  
  const roundedScore = Math.round(weightedScore);
  console.log('Final weighted score:', roundedScore);
  return roundedScore;
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

export const calculateWellbeingScore = async (userId, fitnessData, sleepData, meditationData, moodScore, weights) => {
  try {
    console.log('Starting wellbeing score calculation for user:', userId);
    console.log('Fitness data received:', fitnessData);
    console.log('Sleep data received:', sleepData);
    console.log('Meditation data received:', meditationData);
    console.log('Mood score received:', moodScore);
    console.log('Weights received:', weights);
    
    const { exercises, meals, waterIntakes, wellbeingParams } = fitnessData;
    const { sleepLogs, sleepGoal } = sleepData;
    const { totalMeditationMinutes, streak, averageDuration, meditations } = meditationData;

    // Use wellbeingParams as goals
    const goals = { ...wellbeingParams, sleepHoursPerNight: sleepGoal };

    console.log('Debug - Using wellbeing params and sleep goal as goals:', goals);

    // Calculate component scores
    const componentScores = {
      fitness: calculateFitnessScore(exercises, goals),
      sleep: calculateSleepScore(sleepLogs, goals),
      mood: moodScore, // Use the provided mood score
      meditation: calculateMeditationScore(totalMeditationMinutes, streak, averageDuration, goals)
    };

    console.log('Debug - Component scores:', componentScores);

    const overallScore = calculateOverallWellbeingScore(componentScores, weights);

    console.log('Debug - Overall wellbeing score:', overallScore);

    return {
      overallScore,
      componentScores,
      goals,
      recentActivities: {
        exercises: exercises.slice(-5),
        meals: meals.slice(-5),
        waterIntakes: waterIntakes.slice(-5),
        sleepLogs: sleepLogs.slice(-5),
        meditations: meditations.slice(-5)
      }
    };
  } catch (error) {
    console.error('Error calculating wellbeing score:', error);
    throw error;
  }
};