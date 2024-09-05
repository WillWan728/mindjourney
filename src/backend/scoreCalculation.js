export const calculateOverallWellbeingScore = (componentScores) => {
  const { fitness, sleep, mood, meditation } = componentScores;
  
  // Each component contributes 25% to the total score
  const fitnessScore = fitness * 0.25;
  const sleepScore = sleep * 0.25;
  const moodScore = mood * 0.25;
  const meditationScore = meditation * 0.25;

  // Sum up all the weighted scores
  const totalScore = fitnessScore + sleepScore + moodScore + meditationScore;

  // Convert to percentage and round to nearest integer
  const percentageScore = Math.round(totalScore * 10);

  // Ensure the score doesn't exceed 100%
  return Math.min(percentageScore, 100);
};