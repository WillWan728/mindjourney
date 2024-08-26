import React, { useState, useEffect } from 'react';
import '../css/moodtracker.css'

const MoodTracker = () => {
  const [moodColor, setMoodColor] = useState('#FFFF00');
  const [factors, setFactors] = useState([]);
  const [notes, setNotes] = useState('');
  const [savedMoods, setSavedMoods] = useState([]);

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const response = await fetch('/api/moods');
      const data = await response.json();
      setSavedMoods(data);
    } catch (error) {
      console.error('Error fetching moods:', error);
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

  const saveMood = async () => {
    const moodData = {
      color: moodColor,
      factors: factors,
      notes: notes,
      date: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moodData),
      });
      const savedMood = await response.json();
      setSavedMoods([savedMood, ...savedMoods]);
      setNotes('');
      setFactors([]);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return (
    <div className="mood-tracker-container">
      <h1>Mood Tracker</h1>
      <div className="mood-selector">
        <h3>How are you feeling today?</h3>
        <select 
          value={moodColor} 
          onChange={(e) => setMoodColor(e.target.value)}
        >
          <option value="#FF0000">Angry (Red)</option>
          <option value="#FFA500">Stressed (Orange)</option>
          <option value="#FFFF00">Happy (Yellow)</option>
          <option value="#008000">Calm (Green)</option>
          <option value="#0000FF">Sad (Blue)</option>
          <option value="#800080">Anxious (Purple)</option>
        </select>
      </div>
      <div className="mood-factors">
        <h3>What factors are influencing your mood?</h3>
        <div className="checkbox-group">
          {['Work', 'Relationships', 'Health', 'Finance', 'Hobbies'].map((factor) => (
            <label key={factor}>
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
      <div className="mood-notes">
        <h3>Additional Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter any additional thoughts or feelings..."
          rows="4"
        />
      </div>
      <button onClick={saveMood} className="save-mood-btn">Save Mood</button>
      <div className="saved-moods">
        <h3>Mood History</h3>
        {savedMoods.map((mood) => (
          <div key={mood.date} className="mood-entry">
            <p className="mood-date">{new Date(mood.date).toLocaleString()}</p>
            <div className="mood-color" style={{ backgroundColor: mood.color }}></div>
            <p className="mood-factors-list">Factors: {mood.factors.join(', ')}</p>
            <p className="mood-notes-content">{mood.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;