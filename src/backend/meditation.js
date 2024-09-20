// src/backend/meditation.js

import { collection, query, where, getDocs, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const MEDITATION_EXERCISES = [
  {
    title: "4-7-8 Breathing",
    category: "Breathing",
    description: "A relaxing breath technique to reduce anxiety and promote sleep.",
    steps: [
      "Sit comfortably with your back straight.",
      "Place the tip of your tongue against the ridge behind your upper front teeth.",
      "Exhale completely through your mouth, making a whoosh sound.",
      "Close your mouth and inhale quietly through your nose to a mental count of 4.",
      "Hold your breath for a count of 7.",
      "Exhale completely through your mouth, making a whoosh sound to a count of 8.",
      "Repeat the cycle three more times for a total of four breaths."
    ]
  },
  {
    title: "Box Breathing",
    category: "Breathing",
    description: "A simple technique to calm your nervous system.",
    steps: [
      "Sit upright in a comfortable position.",
      "Slowly exhale all of the air from your lungs.",
      "Inhale slowly through your nose to the count of 4.",
      "Hold your breath for a count of 4.",
      "Exhale through your mouth for a count of 4.",
      "Hold your breath for a final count of 4.",
      "Repeat this process for 4-5 minutes or until you feel relaxed."
    ]
  },
  {
    title: "Body Scan Meditation",
    category: "Meditation",
    description: "A practice to increase awareness of your body and release tension.",
    steps: [
      "Lie down in a comfortable position.",
      "Close your eyes and focus on your breath for a few moments.",
      "Start to focus your attention on your toes, noticing any sensations.",
      "Slowly move your attention up through your body, focusing on each part.",
      "If you notice any tension, try to relax that area as you breathe out.",
      "Continue until you've scanned your entire body.",
      "Take a moment to notice how your body feels as a whole.",
      "Slowly open your eyes and return to your surroundings."
    ]
  },
  {
    title: "Loving-Kindness Meditation",
    category: "Meditation",
    description: "A practice to cultivate compassion for yourself and others.",
    steps: [
      "Sit comfortably with your eyes closed.",
      "Take a few deep breaths to center yourself.",
      "Bring to mind someone you care about deeply.",
      "Silently repeat phrases like: 'May you be happy. May you be healthy. May you be safe.'",
      "Next, direct these phrases towards yourself.",
      "Extend these wishes to a neutral person, then to someone you find difficult.",
      "Finally, extend these wishes to all beings everywhere.",
      "Sit quietly for a moment, then slowly open your eyes."
    ]
  },
  {
    title: "Mindful Walking",
    category: "Movement",
    description: "A way to practice mindfulness while moving.",
    steps: [
      "Find a quiet place to walk, either indoors or outdoors.",
      "Begin walking at a natural pace.",
      "Focus on the sensation of walking - how your feet feel as they touch the ground.",
      "Notice the movement of your legs and the rest of your body as you walk.",
      "Be aware of your surroundings - sights, sounds, smells.",
      "If your mind wanders, gently bring your attention back to the sensation of walking.",
      "Continue for 10-15 minutes or longer if you wish."
    ]
  },
  {
    title: "Progressive Muscle Relaxation",
    category: "Relaxation",
    description: "A technique to release tension throughout your body.",
    steps: [
      "Lie down or sit comfortably.",
      "Starting with your toes, tense the muscles as tightly as you can.",
      "Hold for a count of 10.",
      "Relax your toes completely. Notice the difference between tension and relaxation.",
      "Move to your feet and repeat the process.",
      "Continue up through your body, tensing and relaxing each muscle group.",
      "Finish by tensing and relaxing your facial muscles.",
      "Take a few deep breaths and notice how your body feels."
    ]
  }
];

export const EXERCISE_CATEGORIES = ['All', ...new Set(MEDITATION_EXERCISES.map(ex => ex.category))];

export const INITIAL_MEDITATION_STATE = {
  date: '',
  duration: '',
  exercise: '',
  notes: ''
};

export const FIREBASE_COLLECTION_NAME = 'meditations';

export const TABS = {
  EXERCISES: 'exercises',
  LOG: 'log',
  HISTORY: 'history'
};

export const fetchMeditations = async (userId, startDate, endDate) => {
  try {
    const meditationsRef = collection(db, 'meditations');
    let constraints = [where('userId', '==', userId)];
    
    if (startDate instanceof Date) {
      constraints.push(where('date', '>=', startDate));
    }
    if (endDate instanceof Date) {
      constraints.push(where('date', '<=', endDate));
    }
    
    constraints.push(orderBy('date', 'desc'));
    
    const q = query(meditationsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching meditations:", error);
    return [];
  }
};

export const addMeditation = async (userId, meditationData) => {
  const meditationCollection = collection(db, FIREBASE_COLLECTION_NAME);
  const docRef = await addDoc(meditationCollection, {
    ...meditationData,
    userId,
    date: Timestamp.fromDate(new Date(meditationData.date))
  });
  return docRef.id;
};

export const calculateTotalMeditationTime = (meditations) => {
  return meditations.reduce((total, meditation) => total + parseInt(meditation.duration), 0);
};

export const getMeditationStreak = (meditations) => {
  if (meditations.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date(meditations[0].date.toDate());

  for (let i = 1; i < meditations.length; i++) {
    const meditationDate = new Date(meditations[i].date.toDate());
    const dayDifference = (currentDate - meditationDate) / (1000 * 3600 * 24);

    if (dayDifference === 1) {
      streak++;
      currentDate = meditationDate;
    } else if (dayDifference > 1) {
      break;
    }
  }

  return streak;
};

export const getAverageMeditationDuration = (meditations) => {
  if (meditations.length === 0) return 0;
  const totalDuration = calculateTotalMeditationTime(meditations);
  return Math.round(totalDuration / meditations.length);
};

export const getMostFrequentExercise = (meditations) => {
  if (meditations.length === 0) return null;

  const exerciseCounts = meditations.reduce((counts, meditation) => {
    counts[meditation.exercise] = (counts[meditation.exercise] || 0) + 1;
    return counts;
  }, {});

  return Object.entries(exerciseCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
};

export const filterMeditationsByCategory = (meditations, category) => {
  if (category === "All") return meditations;
  return meditations.filter(meditation => 
    MEDITATION_EXERCISES.find(exercise => exercise.title === meditation.exercise)?.category === category
  );
};