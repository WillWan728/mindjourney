// dashboard.js
import { db } from '../config/firebase';
import {
  calculateFitnessScore,
  calculateSleepScore,
  calculateMoodScore,
  calculateMeditationScore,
  calculateOverallWellbeingScore,
  COMPONENT_WEIGHTS,
} from '../utils/wellbeingUtils';
import { moodOptions } from './moodDiary';
import { 
  doc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  Timestamp, 
  getDoc,
  setDoc
} from 'firebase/firestore';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

const COMPONENT_EMOJI = {
  sleep: "💤",
  fitness: "🏃‍♂️",
  mood: "✏️",
  healthyHabits: "🥳",
  mindfulness: "🧘",
  goals: "🎯"
};

export class DashboardManager {
  constructor(userId, onUpdate) {
    this.userId = userId;
    this.onUpdate = onUpdate;
    this.unsubscribes = [];
    this.data = {
      user: null,
      wellbeing: null,
      sleepLogs: [],
      exercises: [],
      waterLogs: [],
      moodLogs: [],
      meditations: [],
      goals: null
    };
  }

  startListening() {
    this.fetchInitialData();
    this.listenToCollections();
    this.listenToGoals();
  }

  stopListening() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes = [];
  }

  async fetchInitialData() {
    try {
      const userRef = doc(db, 'users', this.userId);
      const wellbeingRef = doc(db, 'wellbeing', this.userId);
      
      const [userDoc, wellbeingDoc] = await Promise.all([
        getDoc(userRef),
        getDoc(wellbeingRef)
      ]);

      this.data.user = userDoc.data();
      this.data.wellbeing = wellbeingDoc.data();
      
      this.updateDashboard();
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  }

  listenToCollections() {
    const collections = ['sleepLogs', 'exercises', 'waterLogs', 'moodLogs', 'meditations'];
    collections.forEach(collectionName => this.listenToCollection(collectionName));
  }

  listenToCollection(collectionName) {
    const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - ONE_WEEK_IN_MS));
    const collectionRef = collection(db, 'users', this.userId, collectionName);
    const q = query(
      collectionRef,
      where('date', '>=', oneWeekAgo),
      orderBy('date', 'desc'),
      limit(7)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      this.data[collectionName] = snapshot.docs.map(doc => doc.data());
      this.updateDashboard();
    });

    this.unsubscribes.push(unsubscribe);
  }

  listenToGoals() {
    const goalsRef = collection(db, 'users', this.userId, 'goals');
    const q = query(goalsRef, where('status', '==', 'active'), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      this.data.goals = snapshot.docs[0]?.data() || null;
      this.updateDashboard();
    });

    this.unsubscribes.push(unsubscribe);
  }

  updateDashboard() {
    if (!this.data.user || !this.data.wellbeing) return;

    const componentScores = {
      fitness: calculateFitnessScore(this.data.exercises, this.data.waterLogs, this.data.wellbeing),
      sleep: calculateSleepScore(this.data.sleepLogs, this.data.wellbeing),
      mood: calculateMoodScore({ moods: this.data.moodLogs }),
      meditation: calculateMeditationScore(this.data.meditations, this.data.wellbeing)
    };

    const weights = this.data.user.componentWeights || COMPONENT_WEIGHTS;
    const overallScore = calculateOverallWellbeingScore(componentScores, weights);

    const latestMood = this.data.moodLogs[0]?.mood || 'Not logged yet';
    const latestMoodEmoji = moodOptions.find(option => option.value === latestMood)?.emoji || '❓';

    const processedData = {
      wellbeingScore: Math.round(overallScore),
      cards: [
        {
          title: "Sleep",
          emoji: COMPONENT_EMOJI.sleep,
          link: "/sleeptracker",
          data: {
            averageDuration: DashboardManager.formatDuration(DashboardManager.calculateAverageSleepDuration(this.data.sleepLogs)),
            averageQuality: DashboardManager.calculateAverageSleepQuality(this.data.sleepLogs).toFixed(1)
          }
        },
        {
          title: "Fitness",
          emoji: COMPONENT_EMOJI.fitness,
          link: "/fitness",
          data: {
            totalCaloriesBurned: DashboardManager.calculateTotalCaloriesBurned(this.data.exercises),
            totalExerciseDuration: DashboardManager.formatDuration(DashboardManager.calculateTotalExerciseDuration(this.data.exercises))
          }
        },
        {
          title: "Mood Diary",
          emoji: COMPONENT_EMOJI.mood,
          link: "/moodtracker",
          data: {
            totalEntries: this.data.moodLogs.length,
            latestMood: latestMood,
            latestMoodEmoji: latestMoodEmoji
          }
        },
        {
          title: "Healthy Habits",
          emoji: COMPONENT_EMOJI.healthyHabits,
          link: "/healthyhabits",
          data: {
            reminder1: "Remember to stay hydrated",
            reminder2: "Have you had your 5 a day?"
          }
        },
        {
          title: "Mindfulness",
          emoji: COMPONENT_EMOJI.mindfulness,
          link: "/mindfulness",
          data: {
            completedSessions: this.data.meditations.length,
            totalMinutes: DashboardManager.formatDuration(DashboardManager.calculateTotalMeditationMinutes(this.data.meditations))
          }
        },
        {
          title: "Goals",
          emoji: COMPONENT_EMOJI.goals,
          link: "/goals",
          data: this.data.goals || { title: 'No active goal', targetDate: null }
        }
      ],
      componentWeights: weights
    };

    this.onUpdate(processedData);

    this.updateWellbeingScore(overallScore);
  }

  async updateWellbeingScore(newScore) {
    const currentDate = new Date();
    const lastUpdateDate = this.data.user.lastWellbeingUpdate ? this.data.user.lastWellbeingUpdate.toDate() : null;
    const shouldUpdateScore = !lastUpdateDate || (currentDate - lastUpdateDate) >= ONE_WEEK_IN_MS;

    if (shouldUpdateScore) {
      const userDocRef = doc(db, 'users', this.userId);
      try {
        await updateDoc(userDocRef, {
          wellbeingScore: Math.round(newScore),
          lastWellbeingUpdate: Timestamp.fromDate(currentDate)
        });
      } catch (error) {
        console.error("Error updating wellbeing score:", error);
      }
    }
  }

  // Helper methods
  static formatDuration(minutes) {
    if (!minutes) return 'No data';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  static calculateAverageSleepDuration(sleepLogs) {
    if (sleepLogs.length === 0) return 0;
    const totalDuration = sleepLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    return totalDuration / sleepLogs.length;
  }

  static calculateAverageSleepQuality(sleepLogs) {
    if (sleepLogs.length === 0) return 0;
    const totalQuality = sleepLogs.reduce((sum, log) => sum + (log.quality || 0), 0);
    return totalQuality / sleepLogs.length;
  }

  static calculateTotalCaloriesBurned(exercises) {
    return exercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0);
  }

  static calculateTotalExerciseDuration(exercises) {
    return exercises.reduce((sum, exercise) => sum + (exercise.duration || 0), 0);
  }

  static calculateTotalMeditationMinutes(meditations) {
    return meditations.reduce((sum, meditation) => sum + (meditation.duration || 0), 0);
  }

  // Methods for optimistic updates
  async addSleepLog(sleepLog) {
    this.data.sleepLogs.unshift(sleepLog);
    this.updateDashboard();

    const sleepLogRef = doc(collection(db, 'users', this.userId, 'sleepLogs'));
    try {
      await setDoc(sleepLogRef, sleepLog);
    } catch (error) {
      console.error("Error adding sleep log:", error);
      this.data.sleepLogs.shift();
      this.updateDashboard();
    }
  }

  async addExercise(exercise) {
    this.data.exercises.unshift(exercise);
    this.updateDashboard();

    const exerciseRef = doc(collection(db, 'users', this.userId, 'exercises'));
    try {
      await setDoc(exerciseRef, exercise);
    } catch (error) {
      console.error("Error adding exercise:", error);
      this.data.exercises.shift();
      this.updateDashboard();
    }
  }

  async addMoodLog(moodLog) {
    this.data.moodLogs.unshift(moodLog);
    this.updateDashboard();

    const moodLogRef = doc(collection(db, 'users', this.userId, 'moodLogs'));
    try {
      await setDoc(moodLogRef, moodLog);
    } catch (error) {
      console.error("Error adding mood log:", error);
      this.data.moodLogs.shift();
      this.updateDashboard();
    }
  }

  async addMeditation(meditation) {
    this.data.meditations.unshift(meditation);
    this.updateDashboard();

    const meditationRef = doc(collection(db, 'users', this.userId, 'meditations'));
    try {
      await setDoc(meditationRef, meditation);
    } catch (error) {
      console.error("Error adding meditation:", error);
      this.data.meditations.shift();
      this.updateDashboard();
    }
  }
}

export default DashboardManager;