import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../css/moodtracker.css';
import Navbar2 from './navbar2';
import { saveMood, deleteMood, fetchMoods } from '../backend/moodDiary';

const moodOptions = [
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

const prompts = [
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

const factorOptions = ['Work', 'Relationships', 'Health', 'Finance', 'Hobbies', 'Other'];

const MoodTracker = () => {
  const [mood, setMood] = useState('');
  const [factors, setFactors] = useState([]);
  const [savedMoods, setSavedMoods] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('add');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryEntry, setDiaryContent] = useState('');
  const [currentMoodScore, setCurrentMoodScore] = useState(0);
  const [error, setError] = useState(null);
  const [showMoodGoals, setShowMoodGoals] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    console.log("Component mounted");
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log("Auth state changed", user ? "User logged in" : "User not logged in");
      if (user) {
        setIsAuthenticated(true);
        fetchUserMoods(user.uid);
        fetchWellbeingParams(user.uid);
      } else {
        setIsAuthenticated(false);
        setSavedMoods([]);
        setIsLoading(false);
      }
    });

    setRandomPrompt();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (savedMoods.length > 0) {
      calculateStreak(savedMoods);
      
      const latestMood = savedMoods[0];
      const latestMoodOption = moodOptions.find(option => option.value === latestMood.mood);
      if (latestMoodOption) {
        setCurrentMoodScore(latestMoodOption.score);
      }
    }
  }, [savedMoods]);

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

    setStreak(currentStreak);
  };

  const fetchUserMoods = async (userId) => {
    console.log("Fetching user moods for userId:", userId);
    try {
      const moods = await fetchMoods(userId);
      console.log("Moods fetched successfully:", moods);
      setSavedMoods(moods);
    } catch (error) {
      console.error("Error fetching moods:", error);
      setError("Failed to fetch moods. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWellbeingParams = async (userId) => {
    try {
      const docRef = doc(db, 'wellbeing', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setShowMoodGoals(data.dailyMoodCheck);
      }
    } catch (error) {
      console.error("Error fetching wellbeing parameters:", error);
    }
  };

  const setRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
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
      diaryTitle: diaryTitle,
      diaryEntry: diaryEntry
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
        <h1 className="main-title">Mood Tracker</h1>
        
        {showMoodGoals && (
          <div className="mood-goals">
            <p>Current Mood Score: {currentMoodScore.toFixed(1)} / 5</p>
            <p>Current Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
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
        </div>
        
        {activeTab === 'add' && (
          <div className="add-mood-log">
            <form onSubmit={handleSaveMood} className="mood-form">
              <div className="form-group">
                <label htmlFor="mood-select">How are you feeling today?</label>
                <select 
                  id="mood-select"
                  value={mood} 
                  onChange={(e) => setMood(e.target.value)}
                >
                  {moodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group factors-group">
                <label>Factors influencing your mood:</label>
                <div className="factors-grid">
                  {factorOptions.map((factor) => (
                    <label key={factor} className="factor-label">
                      <input
                        type="checkbox"
                        value={factor.toLowerCase()}
                        checked={factors.includes(factor.toLowerCase())}
                        onChange={handleFactorChange}
                      />
                      {factor}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="prompt">Reflection Prompt:</label>
                <p id="prompt" className="reflection-prompt">{currentPrompt}</p>
                <button type="button" onClick={setRandomPrompt} className="random-prompt-btn">
                  Get New Prompt
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="diary-title">Diary Entry Title:</label>
                <input
                  type="text"
                  id="diary-title"
                  value={diaryTitle}
                  onChange={(e) => setDiaryTitle(e.target.value)}
                  placeholder="Enter a title for your diary entry"
                />
              </div>
              <div className="form-group">
                <label htmlFor="diary-content">Diary Entry:</label>
                <textarea
                  id="diary-Entry"
                  value={diaryEntry}
                  onChange={(e) => setDiaryContent(e.target.value)}
                  placeholder="Write your diary entry here..."
                  rows="6"
                />
              </div>
              <button type="submit">Save Mood</button>
            </form>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="mood-history">
            <h3>Mood History</h3>
            {savedMoods.length > 0 ? (
              savedMoods.map((savedMood) => (
                <div key={savedMood.id} className="saved-mood">
                  <button onClick={() => handleDeleteMood(savedMood.id)} className="delete-mood-btn">Delete</button>
                  <p className="mood-date">{new Date(savedMood.date).toLocaleDateString()}</p>
                  <div className="mood-display">
                    {moodOptions.find(option => option.value === savedMood.mood)?.emoji} {savedMood.mood} 
                    (Score: {moodOptions.find(option => option.value === savedMood.mood)?.score.toFixed(1)})
                  </div>
                  <p className="mood-factors-list">Factors: {savedMood.factors.join(', ')}</p>
                  <h4 className="diary-title">{savedMood.diaryTitle}</h4>
                  <p className="diary-entry">{savedMood.diaryEntry}</p>
                </div>
              ))
            ) : (
              <p>No moods logged yet. Start tracking your moods to see your history here!</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MoodTracker;