// src/hooks/moodHooks.js

import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { fetchMoods, moodOptions, calculateMoodScoreForWellbeing as calculateMoodScore } from '../backend/moodDiary'

const useMoodData = () => {
  const [moodData, setMoodData] = useState({
    moods: [],
    streak: 0,
    avgMoodScore: 0,
    wellbeingScore: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting to fetch mood data');
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        const fetchedMoodData = await fetchMoods(user.uid);
        console.log('Fetched mood data:', fetchedMoodData);

        if (!fetchedMoodData || !fetchedMoodData.moods) {
          throw new Error('Invalid mood data structure');
        }

        const avgMoodScore = calculateAverageMoodScore(fetchedMoodData.moods);
        console.log('Calculated average mood score:', avgMoodScore);

        const wellbeingScore = calculateMoodScore(fetchedMoodData.moods);
        console.log('Calculated wellbeing mood score:', wellbeingScore);

        setMoodData({
          moods: fetchedMoodData.moods,
          streak: fetchedMoodData.streak || 0,
          avgMoodScore,
          wellbeingScore,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error in useMoodData hook:', error);
        setMoodData(prevState => ({
          ...prevState,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchData();
  }, []);

  return moodData;
};

const calculateAverageMoodScore = (moods) => {
  if (!moods || moods.length === 0) return 0;

  const totalScore = moods.reduce((sum, mood) => {
    const moodScore = moodOptions.find(option => option.value === mood.mood)?.score || 0;
    return sum + moodScore;
  }, 0);

  return totalScore / moods.length;
};

export { calculateMoodScore as calculateMoodScoreForWellbeing };
export default useMoodData;