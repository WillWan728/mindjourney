export const COMPONENT_WEIGHTS = {
    fitness: 0.25,
    sleep: 0.25,
    mood: 0.25,
    meditation: 0.25
  };
  
  export const calculateFitnessScore = (exercises, water) => {
    if (exercises.length === 0 && water.length === 0) return 0;
    const exerciseScore = exercises.length > 0 ? Math.min(50, exercises.length * 10) : 0;
    const waterScore = water.length > 0 ? Math.min(50, water.length * 10) : 0;
    return exerciseScore + waterScore;
  };
  
  export const calculateSleepScore = (sleepLogs) => {
    if (sleepLogs.length === 0) return 0;
    const validDurations = sleepLogs.filter(log => typeof log.duration === 'number' && !isNaN(log.duration));
    if (validDurations.length === 0) return 0;
    const averageSleepDuration = validDurations.reduce((sum, log) => sum + log.duration, 0) / validDurations.length;
    return Math.min(100, (averageSleepDuration / 8) * 100);
  };
  
  export const calculateMoodScore = (moods) => {
    if (moods.length === 0) return 0;
    const moodValues = { 'angry': 1, 'stressed': 2, 'sad': 3, 'calm': 4, 'happy': 5 };
    const moodScores = moods.map(mood => moodValues[mood.value] || 0);
    const averageMoodScore = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    return ((averageMoodScore - 1) / 4) * 100;
  };
  
  export const calculateMeditationScore = (meditations) => {
    if (meditations.length === 0) return 0;
    const totalDuration = meditations.reduce((sum, meditation) => sum + (meditation.duration || 0), 0);
    return Math.min(100, (totalDuration / (30 * 7)) * 100); // Assuming 30 minutes per day is the goal
  };
  
  export const calculateOverallWellbeingScore = (componentScores) => {
    return Object.entries(componentScores).reduce((total, [component, score]) => {
      return total + (score * COMPONENT_WEIGHTS[component]);
    }, 0);
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