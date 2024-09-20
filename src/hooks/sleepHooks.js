import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createSleepLog, getSleepLogs, deleteSleepLog } from '../backend/sleep';

const useSleepData = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [sleepGoal, setSleepGoal] = useState(null);
  const [currentSleepDuration, setCurrentSleepDuration] = useState(0);
  const [sleepForm, setSleepForm] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '',
    waketime: '',
    quality: 5,
    feelRested: 'yes',
    dreamed: 'no',
    wakeUps: 0,
    notes: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      if (user) {
        fetchSleepLogs(user.uid);
        fetchWellbeingParams(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWellbeingParams = async (userId) => {
    try {
      const docRef = doc(db, 'wellbeing', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSleepGoal(Math.round(parseFloat(data.sleepHoursPerNight)));
      }
    } catch (error) {
      setError("Error fetching wellbeing parameters: " + error.message);
    }
  };

  const fetchSleepLogs = async (userId) => {
    try {
      const logs = await getSleepLogs(userId);
      setSleepLogs(logs);
      setLoading(false);
    } catch (error) {
      setError("Error fetching sleep logs: " + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sleepLogs.length > 0) {
      const lastLog = sleepLogs[0]; // Assuming logs are sorted with the most recent first
      const bedtime = new Date(lastLog.bedtime);
      const waketime = new Date(lastLog.waketime);
      let duration = (waketime - bedtime) / (1000 * 60 * 60); // in hours
      if (duration < 0) duration += 24; // Adjust for sleep past midnight
      setCurrentSleepDuration(duration);
    }
  }, [sleepLogs]);

  const handleSleepSubmit = async () => {
    if (!user) {
      setError("User is not authenticated");
      return;
    }

    try {
      await createSleepLog(user.uid, sleepForm);
      fetchSleepLogs(user.uid);
      setSleepForm({
        date: new Date().toISOString().split('T')[0],
        bedtime: '',
        waketime: '',
        quality: 5,
        feelRested: 'yes',
        dreamed: 'no',
        wakeUps: 0,
        notes: ''
      });
    } catch (error) {
      setError("Error saving sleep log: " + error.message);
    }
  };

  const handleDeleteSleep = async (logId) => {
    if (!user) {
      setError("User is not authenticated");
      return;
    }

    try {
      await deleteSleepLog(logId);
      fetchSleepLogs(user.uid);
    } catch (error) {
      setError("Error deleting sleep log: " + error.message);
    }
  };

  const calculateSleepStatistics = useCallback(() => {
    if (sleepLogs.length === 0) return { avgDuration: 0, avgQuality: 0, avgBedtime: null, avgWaketime: null };

    let totalDuration = 0;
    let totalQuality = 0;
    let totalBedtimeMinutes = 0;
    let totalWaketimeMinutes = 0;

    sleepLogs.forEach(log => {
      const bedtime = new Date(log.bedtime);
      const waketime = new Date(log.waketime);
      let duration = (waketime - bedtime) / (1000 * 60 * 60); // in hours
      if (duration < 0) duration += 24; // Adjust for sleep past midnight

      totalDuration += duration;
      totalQuality += log.quality;

      totalBedtimeMinutes += bedtime.getHours() * 60 + bedtime.getMinutes();
      totalWaketimeMinutes += waketime.getHours() * 60 + waketime.getMinutes();
    });

    const avgBedtimeMinutes = totalBedtimeMinutes / sleepLogs.length;
    const avgWaketimeMinutes = totalWaketimeMinutes / sleepLogs.length;

    const avgBedtime = new Date(0, 0, 0, Math.floor(avgBedtimeMinutes / 60), avgBedtimeMinutes % 60);
    const avgWaketime = new Date(0, 0, 0, Math.floor(avgWaketimeMinutes / 60), avgWaketimeMinutes % 60);

    return {
      avgDuration: (totalDuration / sleepLogs.length).toFixed(2),
      avgQuality: (totalQuality / sleepLogs.length).toFixed(1),
      avgBedtime,
      avgWaketime
    };
  }, [sleepLogs]);

  const generateSleepRecommendations = useCallback((stats) => {
    const recommendations = [];

    if (stats.avgDuration < 7) {
      recommendations.push("Try to increase your sleep duration. Aim for 7-9 hours of sleep per night.");
    } else if (stats.avgDuration > 9) {
      recommendations.push("You might be oversleeping. Try to reduce your sleep duration to 7-9 hours per night.");
    }

    if (stats.avgQuality < 6) {
      recommendations.push("Your sleep quality could be improved. Consider establishing a relaxing bedtime routine or optimizing your sleep environment.");
    }

    const idealBedtime = new Date(0, 0, 0, 22, 0); // 10:00 PM
    if (stats.avgBedtime > idealBedtime) {
      recommendations.push("Try to go to bed earlier, ideally around 10:00 PM, to align with your body's natural sleep-wake cycle.");
    }

    recommendations.push("Maintain a consistent wake-up time, even on weekends, to regulate your body's internal clock.");
    recommendations.push("Limit exposure to blue light from screens at least an hour before bedtime.");
    recommendations.push("Create a comfortable sleep environment that is dark, quiet, and cool.");

    return recommendations;
  }, []);

  return {
    user,
    loading,
    error,
    sleepLogs,
    sleepGoal,
    currentSleepDuration,
    sleepForm,
    setSleepForm,
    handleSleepSubmit,
    handleDeleteSleep,
    calculateSleepStatistics,
    generateSleepRecommendations
  };
};

export default useSleepData;