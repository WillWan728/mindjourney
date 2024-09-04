// src/backend/wellbeing.js

export const calculateOverallWellbeingScore = (componentScores) => {
  const { fitness, sleep, mood, meditation } = componentScores;
  
  // Count how many components have a non-zero score
  const activeComponents = [fitness, sleep, mood, meditation].filter(score => score > 0).length;
  
  // If no components are active, return 0
  if (activeComponents === 0) return 0;
  
  // Calculate the average score of active components
  const totalScore = fitness + sleep + mood + meditation;
  return totalScore / activeComponents;
};