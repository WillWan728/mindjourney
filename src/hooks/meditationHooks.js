// src/hooks/meditationHooks.js

import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  fetchMeditations,
  calculateTotalMeditationTime,
  getMeditationStreak,
  getAverageMeditationDuration,
  getMostFrequentExercise
} from '../backend/meditation';

const useMeditationData = () => {
  const [meditationData, setMeditationData] = useState({
    meditations: [],
    totalMeditationMinutes: 0,
    streak: 0,
    averageDuration: 0,
    mostFrequentExercise: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Fetch meditations for the last 30 days
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        const meditations = await fetchMeditations(user.uid, startDate, endDate);

        const totalMeditationMinutes = calculateTotalMeditationTime(meditations);
        const streak = getMeditationStreak(meditations);
        const averageDuration = getAverageMeditationDuration(meditations);
        const mostFrequentExercise = getMostFrequentExercise(meditations);

        setMeditationData({
          meditations,
          totalMeditationMinutes,
          streak,
          averageDuration,
          mostFrequentExercise,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching meditation data:', error);
        setMeditationData(prevState => ({
          ...prevState,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchData();
  }, []);

  return meditationData;
};

export default useMeditationData;