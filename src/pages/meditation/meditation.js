import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import Navbar2 from '../navbar2';
import '../../css/meditation.css';
import { TABS } from '../../backend/meditation';
import ExerciseForm from './ExerciseForm';
import LogForm from './LogForm';
import HistoryForm from './HistoryForm';

const Meditation = () => {
  const [activeTab, setActiveTab] = useState(TABS.EXERCISES);
  const [meditationLogs, setMeditationLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [weeklyMeditationGoal, setWeeklyMeditationGoal] = useState(0);
  const [weeklyMeditationTime, setWeeklyMeditationTime] = useState(0);

  const calculateWeeklyMeditationTime = useCallback(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyTime = meditationLogs
      .filter(log => {
        return log.date >= oneWeekAgo && log.date <= now;
      })
      .reduce((total, log) => total + parseInt(log.duration, 10), 0);
    
    setWeeklyMeditationTime(weeklyTime);
  }, [meditationLogs]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setUser(user);
      if (user) {
        const meditationsRef = collection(db, 'meditations');
        const q = query(
          meditationsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );

        const unsubscribeMeditations = onSnapshot(q, (snapshot) => {
          const logs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date ? new Date(data.date.seconds * 1000) : new Date(),
            };
          });
          console.log("Received updated meditation logs:", logs);
          setMeditationLogs(logs);
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching meditation logs: ", error);
          setError("Failed to fetch meditation logs. Please try again.");
          setIsLoading(false);
        });

        const fetchMeditationGoal = async () => {
          try {
            const docRef = doc(db, 'wellbeing', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setWeeklyMeditationGoal(data.weeklyMeditationMinutes || 0);
            }
          } catch (error) {
            console.error("Error fetching meditation goal: ", error);
          }
        };
        fetchMeditationGoal();

        return () => unsubscribeMeditations();
      } else {
        setMeditationLogs([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    calculateWeeklyMeditationTime();
  }, [calculateWeeklyMeditationTime, meditationLogs]);

  const handleDeleteMeditation = async (logId) => {
    try {
      await deleteDoc(doc(db, 'meditations', logId));
    } catch (error) {
      console.error("Error deleting meditation log: ", error);
      setError("Failed to delete meditation log. Please try again.");
    }
  };

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
            {activeTab === TABS.LOG && <LogForm user={user} />}
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