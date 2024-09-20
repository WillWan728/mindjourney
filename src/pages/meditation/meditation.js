import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import Navbar2 from '../navbar2';
import '../../css/meditation.css';
import { TABS, fetchMeditations } from '../../backend/meditation';
import ExerciseForm from './ExerciseForm';
import LogForm from './LogForm';
import HistoryForm from './HistoryForm';

const Meditation = () => {
  const [activeTab, setActiveTab] = useState(TABS.EXERCISES);
  const [meditationLogs, setMeditationLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [weeklyMeditationGoal, setWeeklyMeditationGoal] = useState(0);
  const [weeklyMeditationTime, setWeeklyMeditationTime] = useState(0);

  const calculateWeeklyMeditationTime = useCallback(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyTime = meditationLogs
      .filter(log => {
        const logDate = log.date.toDate();
        return logDate >= oneWeekAgo && logDate <= now;
      })
      .reduce((total, log) => total + parseInt(log.duration, 10), 0);
    
    setWeeklyMeditationTime(weeklyTime);
  }, [meditationLogs]);

  const fetchMeditationLogs = useCallback(async (userId) => {
    setIsLoading(true);
    setError(null);
    try {
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const logs = await fetchMeditations(userId, oneYearAgo, now);
      setMeditationLogs(logs);
    } catch (error) {
      console.error("Error fetching meditation logs: ", error);
      setError("Failed to fetch meditation logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMeditationGoal = useCallback(async (userId) => {
    try {
      const docRef = doc(db, 'wellbeing', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWeeklyMeditationGoal(data.weeklyMeditationMinutes || 0);
      }
    } catch (error) {
      console.error("Error fetching meditation goal: ", error);
    }
  }, []);

  const handleDeleteMeditation = useCallback(async (logId) => {
    try {
      await deleteDoc(doc(db, 'meditations', logId));
      setMeditationLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      calculateWeeklyMeditationTime();
    } catch (error) {
      console.error("Error deleting meditation log: ", error);
      setError("Failed to delete meditation log. Please try again.");
    }
  }, [calculateWeeklyMeditationTime]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        fetchMeditationLogs(user.uid);
        fetchMeditationGoal(user.uid);
      } else {
        setUser(null);
        setMeditationLogs([]);
      }
    });

    return () => unsubscribe();
  }, [fetchMeditationLogs, fetchMeditationGoal]);

  useEffect(() => {
    calculateWeeklyMeditationTime();
  }, [calculateWeeklyMeditationTime, meditationLogs]);

  return (
    <>
      <Navbar2 />
      <div className="meditation-container">
        <h1 className="main-title">Meditation and Mindfulness</h1>
        
        <div className="meditation-goals">
          <p>Weekly Meditation: {weeklyMeditationTime} / {weeklyMeditationGoal} minutes</p>
        </div>
        
        <div className="tab-navigation">
          {Object.values(TABS).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active' : ''}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error && <p className="error-message">{error}</p>}
        
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="content-box">
            {activeTab === TABS.EXERCISES && <ExerciseForm />}
            {activeTab === TABS.LOG && <LogForm user={user} fetchMeditationLogs={fetchMeditationLogs} />}
            {activeTab === TABS.HISTORY && (
              <HistoryForm 
                meditationLogs={meditationLogs} 
                handleDeleteMeditation={handleDeleteMeditation} 
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Meditation;