import React, { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import '../../css/moodtracker.css';
import Navbar2 from '.././navbar2';
import { saveMood, deleteMood, fetchMoods, moodOptions, factorOptions, getRandomPrompt } from '../../backend/mood';
import MoodLogForm from './MoodLogForm';
import HistoryForm from './HistoryForm';
import StatsForm from './StatsFrom'

const MoodTracker = () => {
  const [mood, setMood] = useState('');
  const [factors, setFactors] = useState([]);
  const [moodData, setMoodData] = useState({ moods: [], streak: 0, stats: {} });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('add');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryEntry, setDiaryContent] = useState('');
  const [currentMoodScore, setCurrentMoodScore] = useState(0);
  const [error, setError] = useState(null);
  const [showMoodGoals, setShowMoodGoals] = useState(true);

  useEffect(() => {
    console.log("Component mounted");
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log("Auth state changed", user ? "User logged in" : "User not logged in");
      if (user) {
        setIsAuthenticated(true);
        fetchUserMoods(user.uid);
      } else {
        setIsAuthenticated(false);
        setMoodData({ moods: [], streak: 0, stats: {} });
        setIsLoading(false);
      }
    });

    setCurrentPrompt(getRandomPrompt());

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (moodData.moods && moodData.moods.length > 0) {
      const latestMood = moodData.moods[0];
      const latestMoodOption = moodOptions.find(option => option.value === latestMood.mood);
      if (latestMoodOption) {
        setCurrentMoodScore(latestMoodOption.score);
      }
    }
  }, [moodData.moods]);

  const fetchUserMoods = async (userId) => {
    console.log("Fetching user moods for userId:", userId);
    try {
      const data = await fetchMoods(userId);
      console.log("Moods fetched successfully:", data);
      setMoodData(data);
    } catch (error) {
      console.error("Error fetching moods:", error);
      setError("Failed to fetch moods. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFactorChange = (e) => {
    const factor = e.target.value;
    if (e.target.checked) {
      setFactors([...factors, factor]);
    } else {
      setFactors(factors.filter(f => f !== factor));
    }
  };

  const handleSaveMood = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }

    if (!mood) {
      alert("Please select a mood before saving.");
      return;
    }

    const newMood = {
      mood: mood,
      factors: factors,
      diaryEntry: diaryEntry,
      diaryTitle: diaryTitle
    };

    try {
      await saveMood(auth.currentUser.uid, newMood);
      fetchUserMoods(auth.currentUser.uid);
      // Reset form
      setMood('');
      setFactors([]);
      setDiaryTitle('');
      setDiaryContent('');
    } catch (error) {
      console.error("Error adding mood: ", error);
      setError("Failed to save mood. Please try again.");
    }
  };

  const handleDeleteMood = async (moodId) => {
    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }

    try {
      await deleteMood(moodId);
      fetchUserMoods(auth.currentUser.uid);
    } catch (error) {
      console.error("Error deleting mood: ", error);
      setError("Failed to delete mood. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading... Please wait.</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access the Mood Tracker.</div>;
  }

  return (
    <>
      <Navbar2 />
      <div className="mood-tracker-container">
        <h1 className="main-title">Journaling</h1>
        
        {showMoodGoals && (
          <div className="mood-goals">
            <p>Current Mood Score: {currentMoodScore.toFixed(1)} / 5</p>
            <p>Current Streak: {moodData.streak} day{moodData.streak !== 1 ? 's' : ''}</p>
          </div>
        )}
        
        <div className="tab-navigation">
          <button 
            className={activeTab === 'add' ? 'active' : ''} 
            onClick={() => setActiveTab('add')}
          >
            Add Mood
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >
            Mood History
          </button>
          <button 
            className={activeTab === 'stats' ? 'active' : ''} 
            onClick={() => setActiveTab('stats')}
          >
            Mood Stats
          </button>
        </div>
        
        {activeTab === 'add' && (
          <div className="add-mood-log">
            <MoodLogForm 
              mood={mood}
              setMood={setMood}
              factors={factors}
              handleFactorChange={handleFactorChange}
              diaryTitle={diaryTitle}
              setDiaryTitle={setDiaryTitle}
              diaryEntry={diaryEntry}
              setDiaryEntry={setDiaryContent}
              currentPrompt={currentPrompt}
              setRandomPrompt={() => setCurrentPrompt(getRandomPrompt())}
              handleSaveMood={handleSaveMood}
              moodOptions={moodOptions}
              factorOptions={factorOptions}
            />
          </div>
        )}
        
        {activeTab === 'history' && (
          <HistoryForm 
            savedMoods={moodData.moods || []}
            handleDeleteMood={handleDeleteMood}
            moodOptions={moodOptions}
          />
        )}

        {activeTab === 'stats' && (
          <StatsForm 
            moodStats={moodData.stats || {}}
            moodOptions={moodOptions}
            factorOptions={factorOptions}
          />
        )}
      </div>
    </>
  );
};

export default MoodTracker;