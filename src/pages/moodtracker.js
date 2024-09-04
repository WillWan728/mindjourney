import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import '../css/moodtracker.css';
import Navbar2 from './navbar2';
import { saveMood, deleteMood, fetchMoods } from '../backend/moodDiary';

const moodOptions = [
  { value: '', label: 'Select a mood' },
  { value: 'angry', label: 'Angry 😡', color: '#FF0000' },
  { value: 'stressed', label: 'Stressed 😩', color: '#FFA500' },
  { value: 'happy', label: 'Happy 😀', color: '#FFFF00' },
  { value: 'calm', label: 'Calm 🙂‍↕️', color: '#008000' },
  { value: 'sad', label: 'Sad 😟', color: '#0000FF' },
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

const factorOptions = ['Work', 'Relationships', 'Health', 'Finance', 'Hobbies'];

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);
        fetchUserMoods(user.uid);
      } else {
        setIsAuthenticated(false);
        setSavedMoods([]);
        setIsLoading(false);
      }
    });

    // Set initial random prompt
    setRandomPrompt();

    return () => unsubscribe();
  }, []);

  const setRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
  };

  const fetchUserMoods = async (userId) => {
    try {
      const moods = await fetchMoods(userId);
      setSavedMoods(moods);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching moods: ", error);
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
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access the Mood Tracker.</div>;
  }

  return (
    <>
      <Navbar2 />
      <div className="mood-tracker-container">
        <h1 className="main-title">Mood Tracker</h1>
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
                    <option key={option.value} value={option.value}>{option.label}</option>
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
                  <p className="mood-date">{savedMood.date.toLocaleDateString()}</p>
                  <div className="mood-display" style={{ backgroundColor: moodOptions.find(m => m.value === savedMood.mood)?.color }}>
                    {moodOptions.find(m => m.value === savedMood.mood)?.label}
                  </div>
                  <p className="mood-factors-list">Factors: {savedMood.factors.join(', ')}</p>
                  <h4 className="diary-title">{savedMood.diaryTitle}</h4>
                  <p className="diary-entry">{savedMood.diaryEntry}</p>
                  <p className="mood-notes-content">{savedMood.notes}</p>
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