import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import '../css/sleep.css';
import Navbar2 from './navbar2';
import { createSleepLog, getSleepLogs, updateSleepLog, deleteSleepLog } from '../backend/sleep';

const SleepTracker = () => {
  const [sleepData, setSleepData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '',
    waketime: '',
    quality: 5,
    feelRested: 'yes',
    dreamed: 'no',
    wakeUps: 0,
    notes: ''
  });
  const [sleepLogs, setSleepLogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLogId, setEditingLogId] = useState(null);
  const [activeTab, setActiveTab] = useState('add');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setIsAuthenticated(true);
        fetchSleepLogs(user.uid);
      } else {
        setIsAuthenticated(false);
        setSleepLogs([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSleepLogs = async (userId) => {
    try {
      const logs = await getSleepLogs(userId);
      setSleepLogs(logs);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching sleep logs: ", error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSleepData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }

    try {
      if (editingLogId) {
        await updateSleepLog(editingLogId, sleepData);
      } else {
        await createSleepLog(auth.currentUser.uid, sleepData);
      }
      fetchSleepLogs(auth.currentUser.uid);
      setSleepData({
        date: new Date().toISOString().split('T')[0],
        bedtime: '',
        waketime: '',
        quality: 5,
        feelRested: 'yes',
        dreamed: 'no',
        wakeUps: 0,
        notes: ''
      });
      setEditingLogId(null);
      setActiveTab('history');
    } catch (error) {
      console.error("Error saving sleep log: ", error);
    }
  };

  const handleEdit = (log) => {
    setSleepData({
      date: new Date(log.date).toISOString().split('T')[0],
      bedtime: new Date(log.bedtime).toTimeString().slice(0, 5),
      waketime: new Date(log.waketime).toTimeString().slice(0, 5),
      quality: log.quality,
      feelRested: log.feelRested ? 'yes' : 'no',
      dreamed: log.dreamed ? 'yes' : 'no',
      wakeUps: log.wakeUps,
      notes: log.notes
    });
    setEditingLogId(log.id);
    setActiveTab('add');
  };

  const handleDelete = async (logId) => {
    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }

    try {
      await deleteSleepLog(logId);
      fetchSleepLogs(auth.currentUser.uid);
    } catch (error) {
      console.error("Error deleting sleep log: ", error);
    }
  };

  const calculateSleepStatistics = () => {
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
  };

  const generateSleepRecommendations = (stats) => {
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
  };

  const { avgDuration, avgQuality, avgBedtime, avgWaketime } = calculateSleepStatistics();
  const sleepRecommendations = generateSleepRecommendations({ avgDuration, avgQuality, avgBedtime, avgWaketime });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access the Sleep Tracker.</div>;
  }

  return (
    <>
      <Navbar2 />
      <div className="sleep-tracker-container">
        <h1 className="main-title">Sleep Tracker</h1>
        
        <div className="tab-navigation">
          <button className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}>
            {editingLogId ? 'Edit Sleep Log' : 'Add Sleep Log'}
          </button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>Sleep History</button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>Sleep Stats</button>
        </div>

        {activeTab === 'add' && (
          <div className="add-sleep-log">
            <form onSubmit={handleSubmit} className="sleep-form">
              <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input type="date" id="date" name="date" value={sleepData.date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="bedtime">Bedtime:</label>
                <input type="time" id="bedtime" name="bedtime" value={sleepData.bedtime} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="waketime">Wake time:</label>
                <input type="time" id="waketime" name="waketime" value={sleepData.waketime} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="quality">Sleep Quality (1-10):</label>
                <input type="number" id="quality" name="quality" value={sleepData.quality} onChange={handleInputChange} min="1" max="10" required />
              </div>
              <div className="form-group">
                <label htmlFor="feelRested">Feel Rested?</label>
                <select id="feelRested" name="feelRested" value={sleepData.feelRested} onChange={handleInputChange}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dreamed">Dreamed?</label>
                <select id="dreamed" name="dreamed" value={sleepData.dreamed} onChange={handleInputChange}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="wakeUps">Number of Wake-ups:</label>
                <input type="number" id="wakeUps" name="wakeUps" value={sleepData.wakeUps} onChange={handleInputChange} min="0" />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes:</label>
                <textarea id="notes" name="notes" value={sleepData.notes} onChange={handleInputChange} placeholder="Any notes about your sleep?" />
              </div>
              <button type="submit">{editingLogId ? 'Update' : 'Save'} Sleep Log</button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="sleep-history">
            <h2>Sleep History</h2>
            <div className="sleep-logs">
              {sleepLogs.map((log) => (
                <div key={log.id} className="sleep-log">
                  <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
                  <p><strong>Bedtime:</strong> {new Date(log.bedtime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <p><strong>Wake time:</strong> {new Date(log.waketime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  <p><strong>Quality:</strong> {log.quality}/10</p>
                  <p><strong>Felt Rested:</strong> {log.feelRested ? 'Yes' : 'No'}</p>
                  <p><strong>Dreamed:</strong> {log.dreamed ? 'Yes' : 'No'}</p>
                  <p><strong>Wake-ups:</strong> {log.wakeUps}</p>
                  <p><strong>Notes:</strong> {log.notes}</p>
                  <div className="sleep-log-buttons">
                    <button onClick={() => handleEdit(log)}>Edit</button>
                    <button onClick={() => handleDelete(log.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="sleep-statistics">
            <h2>Sleep Statistics</h2>
            <p><strong>Average Sleep Duration:</strong> {avgDuration} hours</p>
            <p><strong>Average Sleep Quality:</strong> {avgQuality}/10</p>
            <p><strong>Average Bedtime:</strong> {avgBedtime ? avgBedtime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
            <p><strong>Average Wake Time:</strong> {avgWaketime ? avgWaketime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
            <h3>Recommendations for Better Sleep:</h3>
            <ul>
              {sleepRecommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default SleepTracker;