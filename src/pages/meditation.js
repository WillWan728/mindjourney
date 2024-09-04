import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import Navbar2 from './navbar2';
import '../css/meditation.css';
import {
  MEDITATION_EXERCISES,
  EXERCISE_CATEGORIES,
  INITIAL_MEDITATION_STATE,
  TABS,
  fetchMeditations,
  addMeditation,
  calculateTotalMeditationTime,
  getMeditationStreak,
  getAverageMeditationDuration,
  getMostFrequentExercise
} from '../backend/meditation';

const Meditation = () => {
  const [activeTab, setActiveTab] = useState(TABS.EXERCISES);
  const [selectedCategory, setSelectedCategory] = useState(EXERCISE_CATEGORIES[0]);
  const [newMeditation, setNewMeditation] = useState(INITIAL_MEDITATION_STATE);
  const [meditationLogs, setMeditationLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        fetchMeditationLogs(user.uid);
      } else {
        setUser(null);
        setMeditationLogs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMeditationLogs = async (userId) => {
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeditation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please log in to record a meditation.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await addMeditation(user.uid, newMeditation);
      setNewMeditation(INITIAL_MEDITATION_STATE);
      fetchMeditationLogs(user.uid);
    } catch (error) {
      console.error("Error saving meditation log: ", error);
      setError("Failed to save meditation log. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderExercises = () => (
    <div className="exercises-container">
      <div className="category-buttons">
        {EXERCISE_CATEGORIES.map(category => (
          <button 
            key={category} 
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="exercise-grid">
        {MEDITATION_EXERCISES
          .filter(exercise => selectedCategory === 'All' || exercise.category === selectedCategory)
          .map((exercise, index) => (
            <div key={index} className="exercise-card" onClick={() => setSelectedExercise(exercise)}>
              <h3>{exercise.title}</h3>
              <p>{exercise.description}</p>
            </div>
          ))
        }
      </div>
    </div>
  );

  const renderLogForm = () => (
    <form onSubmit={handleSubmit} className="meditation-form">
      <h2>Log Your Meditation</h2>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={newMeditation.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="duration">Duration (minutes):</label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={newMeditation.duration}
          onChange={handleInputChange}
          placeholder="Duration in minutes"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="exercise">Exercise:</label>
        <select
          id="exercise"
          name="exercise"
          value={newMeditation.exercise}
          onChange={handleInputChange}
          required
        >
          <option value="">Select an exercise</option>
          {MEDITATION_EXERCISES.map(exercise => (
            <option key={exercise.title} value={exercise.title}>
              {exercise.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes:</label>
        <textarea
          id="notes"
          name="notes"
          value={newMeditation.notes}
          onChange={handleInputChange}
          placeholder="Any thoughts or feelings about your session?"
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Log Meditation'}
      </button>
    </form>
  );

  const renderHistory = () => (
    <div className="history-container">
      <h2>Your Meditation History</h2>
      <div className="stats">
        <div className="stat-item">
          <h3>Total Meditation Time</h3>
          <p>{calculateTotalMeditationTime(meditationLogs)} minutes</p>
        </div>
        <div className="stat-item">
          <h3>Current Streak</h3>
          <p>{getMeditationStreak(meditationLogs)} days</p>
        </div>
        <div className="stat-item">
          <h3>Average Duration</h3>
          <p>{getAverageMeditationDuration(meditationLogs)} minutes</p>
        </div>
        <div className="stat-item">
          <h3>Most Frequent Exercise</h3>
          <p>{getMostFrequentExercise(meditationLogs)}</p>
        </div>
      </div>
      <table className="meditation-logs">
        <thead>
          <tr>
            <th>Date</th>
            <th>Exercise</th>
            <th>Duration</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {meditationLogs.map(log => (
            <tr key={log.id}>
              <td>{log.date.toDate().toLocaleDateString()}</td>
              <td>{log.exercise}</td>
              <td>{log.duration} minutes</td>
              <td>{log.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Navbar2 />
      <div className="meditation-container">
        <h1 className="main-title">Meditation and Mindfulness</h1>
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
        
        <div className="content-box">
          {activeTab === TABS.EXERCISES && renderExercises()}
          {activeTab === TABS.LOG && renderLogForm()}
          {activeTab === TABS.HISTORY && renderHistory()}
        </div>

        {selectedExercise && (
          <div className="exercise-details">
            <h2>{selectedExercise.title}</h2>
            <p>{selectedExercise.description}</p>
            <ol>
              {selectedExercise.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <button onClick={() => setSelectedExercise(null)}>Close</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Meditation;