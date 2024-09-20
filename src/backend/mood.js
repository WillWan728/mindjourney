import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const moodOptions = [
  { value: '', label: 'Select a mood', emoji: '', score: 0 },
  { value: 'ecstatic', label: 'Ecstatic', emoji: '🤩', score: 5 },
  { value: 'excited', label: 'Excited', emoji: '😃', score: 4.5 },
  { value: 'happy', label: 'Happy', emoji: '😊', score: 4 },
  { value: 'okay', label: 'Okay', emoji: '😐', score: 3 },
  { value: 'sad', label: 'Sad', emoji: '😢', score: 2 },
  { value: 'angry', label: 'Angry', emoji: '😠', score: 1 },
  { value: 'anxious', label: 'Anxious', emoji: '😰', score: 1.5 },
  { value: 'stressed', label: 'Stressed', emoji: '😩', score: 1.5 },
  { value: 'tired', label: 'Tired', emoji: '😴', score: 2.5 },
  { value: 'calm', label: 'Calm', emoji: '😌', score: 3.5 },
];

export const prompts = [
  "What are three things you're grateful for today?",
  "Describe a challenge you're facing and three possible solutions.",
  "What's something you're looking forward to in the near future?",
  "Reflect on a recent accomplishment. How did it make you feel?",
  "Write about a person who has positively influenced your life recently.",
  "What's a goal you're working towards? What steps can you take to achieve it?",
  "Describe your ideal day. What would you do?",
  "What's a fear you'd like to overcome? How might you start facing it?",
  "Write about a recent act of kindness you witnessed or performed.",
  "What's something new you'd like to learn? Why does it interest you?"
];

export const factorOptions = ['Work', 'Relationships', 'Health', 'Finance', 'Hobbies', 'Other'];

export const saveMood = async (userId, moodData) => {
  if (!userId) throw new Error('UserId is required');
  if (!moodData.mood) throw new Error('Mood is required');

  try {
    const moodsCollection = collection(db, 'moods');
    const docRef = await addDoc(moodsCollection, {
      userId: userId,
      mood: moodData.mood,
      factors: moodData.factors || [],
      diaryEntry: moodData.diaryEntry || '',
      diaryTitle: moodData.diaryTitle || '', 
      date: new Date() // Ensure date is a Firebase timestamp
    });
    console.log("Mood saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving mood: ", error);
    throw error;
  }
};

export const fetchMoods = async (userId) => {
  if (!userId) throw new Error('UserId is required');

  try {
    const moodsCollection = collection(db, 'moods');
    const moodsQuery = query(
      moodsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(moodsQuery);
    const moods = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate() // Convert Firestore Timestamp to JS Date
    }));
    
    return { moods, streak: calculateStreak(moods), stats: calculateMoodStats(moods) };
  } catch (error) {
    console.error("Error fetching moods: ", error);
    return { moods: [], streak: 0, stats: {} };
  }
};

export const deleteMood = async (moodId) => {
  if (!moodId) throw new Error('MoodId is required');

  try {
    await deleteDoc(doc(db, 'moods', moodId));
    console.log("Mood deleted with ID: ", moodId);
  } catch (error) {
    console.error("Error deleting mood: ", error);
    throw error;
  }
};

export const getRandomPrompt = () => {
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};

const calculateStreak = (moods) => {
  let currentStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);  // Set to start of day

  for (let mood of moods) {
    let moodDate = new Date(mood.date);
    moodDate.setHours(0, 0, 0, 0);  // Set to start of day

    if (currentDate.getTime() === moodDate.getTime()) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);  // Move to previous day
    } else if (currentDate.getTime() - moodDate.getTime() === 86400000) {  // One day difference
      currentStreak++;
      currentDate = moodDate;
    } else {
      break;  // Streak is broken
    }
  }

  return currentStreak;
};

const calculateMoodStats = (moods) => {
  if (moods.length === 0) return { avgMoodScore: 0, moodCounts: {}, factorCounts: {} };

  let totalScore = 0;
  let moodCounts = {};
  let factorCounts = {};

  moods.forEach(mood => {
    const moodScore = moodOptions.find(option => option.value === mood.mood)?.score || 0;
    totalScore += moodScore;
    moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    mood.factors.forEach(factor => {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    });
  });

  return {
    avgMoodScore: totalScore / moods.length,
    moodCounts,
    factorCounts
  };
};

// New function for wellbeing dashboard
export const calculateMoodScoreForWellbeing = (moods) => {
  if (moods.length === 0) return 0;

  const recentMoods = moods.slice(0, 7); // Consider only the last 7 mood entries
  let totalScore = 0;

  recentMoods.forEach(mood => {
    const moodScore = moodOptions.find(option => option.value === mood.mood)?.score || 0;
    totalScore += moodScore;
  });

  const averageScore = totalScore / recentMoods.length;
  // Normalize the score to be out of 100
  return Math.round((averageScore / 5) * 100); // 5 is the max score in moodOptions
};