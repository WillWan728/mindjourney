import React, { useState, useEffect } from 'react';
import { useAchievement } from '../utils/achievementUtils';
import Navbar2 from './navbar2';
import '../css/achievement.css';
import { Link } from 'react-router-dom';

const AchievementPage = () => {
  const { dailyTasks, userPoints, loading, error } = useAchievement();
  const [activeTab, setActiveTab] = useState('daily');
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const timeRemaining = tomorrow - now;

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setTimeUntilReset(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, []);

  if (loading) return <div className="loading">Loading achievements... Please wait.</div>;
  if (error) return <div className="error">{error}</div>;

  const isCompletedToday = (lastCompleted) => {
    if (!lastCompleted) return false;
    
    let completionDate;
    if (typeof lastCompleted === 'object' && lastCompleted.toDate) {
      completionDate = lastCompleted.toDate();
    } else if (lastCompleted instanceof Date) {
      completionDate = lastCompleted;
    } else if (typeof lastCompleted === 'string') {
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
      <div className="achievement-container centered">
        <div className="achievement-content">
          <h1 className="main-title">Achievements & Rewards</h1>
          <div className="achievement-summary">
            <div className="summary-box">
              <h2>Total Points</h2>
              <p className="summary-value">{userPoints}</p>
            </div>
            <div className="summary-box">
              <h2>Tasks Completed Today</h2>
              <p className="summary-value">{tasksCompletedToday} / {dailyTasks.length}</p>
            </div>
          </div>
          <div className="reset-timer">
            <h3>Time until daily reset:</h3>
            <p className="timer-value">{timeUntilReset}</p>
          </div>
          <div className="tab-navigation centered">
            <button 
              className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              Daily Tasks
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
                <h2 className="section-title">Your Daily Tasks</h2>
                <div className="tasks-grid centered">
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
              </div>
            )}
            {activeTab === 'rewards' && (
              <div className="rewards-content centered">
                <h2 className="section-title">Available Rewards</h2>
                <p className="coming-soon">Redeem your points for these exciting rewards!</p>
                {/* Add your rewards content here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPage;