import React, { useState } from 'react';
import { useAchievement } from '../utils/achievementUtils';
import Navbar2 from './navbar2';
import '../css/achievement.css';
import { Link } from 'react-router-dom';

const AchievementPage = () => {
  const { dailyTasks, userPoints, loading, error } = useAchievement();
  const [activeTab, setActiveTab] = useState('daily');

  if (loading) return <div className="loading">Loading achievements... Please wait.</div>;
  if (error) return <div className="error">{error}</div>;

  const isCompletedToday = (lastCompleted) => {
    if (!lastCompleted) return false;
    
    let completionDate;
    if (typeof lastCompleted === 'object' && lastCompleted.toDate) {
      // Firestore Timestamp
      completionDate = lastCompleted.toDate();
    } else if (lastCompleted instanceof Date) {
      // JavaScript Date object
      completionDate = lastCompleted;
    } else if (typeof lastCompleted === 'string') {
      // ISO string or other date string
      completionDate = new Date(lastCompleted);
    } else {
      console.error('Unexpected lastCompleted format:', lastCompleted);
      return false;
    }

    const today = new Date();
    return completionDate.toDateString() === today.toDateString();
  };

  const tasksCompletedToday = dailyTasks.filter(task => isCompletedToday(task.lastCompleted)).length;

  return (
    <div className="achievement-page">
      <Navbar2 />
      <div className="achievement-container">
        <h1 className="main-title">Daily Achievements</h1>
        <div className="achievement-summary">
          <div className="summary-box">
            <h2>Total Points</h2>
            <p>{userPoints}</p>
          </div>
          <div className="summary-box">
            <h2>Tasks Completed Today</h2>
            <p>{tasksCompletedToday} / {dailyTasks.length}</p>
          </div>
        </div>
        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Tasks
          </button>
          <button 
            className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'daily' && (
            <div className="daily-tasks">
              <h2>Your Daily Tasks</h2>
              {dailyTasks.map(task => {
                const completedToday = isCompletedToday(task.lastCompleted);
                
                return (
                  <div key={task.id} className={`task-card ${completedToday ? 'completed' : ''}`}>
                    <div className="task-icon">{task.icon}</div>
                    <div className="task-info">
                      <h3>{task.name}</h3>
                      <p>{task.description}</p>
                      <p className="points">+{task.points} points</p>
                      <p className="streak">Current Streak: {task.streak} day{task.streak !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="task-status">
                      {completedToday ? (
                        <span className="completed-status">Completed</span>
                      ) : (
                        <Link to={`/${task.id}`} className="task-link">
                          Complete Task
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'achievements' && (
            <div className="achievements-content">
              <h2>Your Achievements</h2>
              <p>Long-term achievements coming soon!</p>
            </div>
          )}
          {activeTab === 'rewards' && (
            <div className="rewards-content">
              <h2>Available Rewards</h2>
              <p>Redeem your points for these exciting rewards!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementPage;