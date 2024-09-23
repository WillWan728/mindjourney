import React, { useState, useEffect } from 'react';
import { useAchievement } from '../utils/achievementUtils';
import Navbar2 from './navbar2';
import '../css/achievement.css';
import { getRewards, redeemReward } from '../backend/achievement';
import { auth } from '../config/firebase';

const AchievementPage = () => {
  const { dailyTasks, achievements, userPoints, loading, error, updateDailyTask, updateExtendedTask, fetchUserData } = useAchievement();
  const [activeTab, setActiveTab] = useState('daily');
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [rewards, setRewards] = useState([]);
  const [redeemError, setRedeemError] = useState(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewardsData = await getRewards();
        setRewards(rewardsData);
      } catch (err) {
        console.error("Error fetching rewards:", err);
      }
    };

    fetchRewards();
  }, []);

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

  const handleRedeemReward = async (rewardId) => {
    try {
      const result = await redeemReward(auth.currentUser.uid, rewardId);
      if (result.success) {
        alert(`Reward redeemed! Your voucher code is: ${result.voucher}`);
        fetchUserData(auth.currentUser.uid);
      }
    } catch (err) {
      setRedeemError(err.message);
    }
  };

  const handleCompleteTask = async (taskId, isExtended = false) => {
    try {
      if (isExtended) {
        const result = await updateExtendedTask(taskId);
        if (result.success) {
          alert(result.message);
        } else {
          alert(result.message);
        }
      } else {
        const result = await updateDailyTask(taskId);
        if (result.success) {
          alert(`Task completed! You earned ${result.pointsEarned} points.`);
        } else {
          alert(result.message);
        }
      }
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  const renderTaskCard = (task, isExtended = false) => {
    const lastCompleted = task.lastCompleted ? new Date(task.lastCompleted.seconds * 1000) : null;
    const completedToday = lastCompleted && lastCompleted.toDateString() === new Date().toDateString();
    
    return (
      <div key={task.id} className="task-card">
        <div className="task-icon">{task.icon}</div>
        <div className="task-info">
          <h3>{task.name}</h3>
          <p>{task.description}</p>
          <p className="points">+{task.points} points</p>
          {isExtended ? (
            <p className="progress">Progress: {task.progress}/{task.goal}</p>
          ) : (
            <p className="streak">Current Streak: {task.streak} day{task.streak !== 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="task-status">
          {isExtended ? (
            <span className={`status-badge ${task.completed ? 'completed' : 'in-progress'}`}>
              {task.completed ? 'Completed' : 'In Progress'}
            </span>
          ) : completedToday ? (
            <span className="status-badge completed">Completed</span>
          ) : (
            <button onClick={() => handleCompleteTask(task.id, isExtended)} className="complete-task-button">
              Complete Task
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading achievements... Please wait.</div>;
  if (error) return <div className="error">{error}</div>;

  const tasksCompletedToday = dailyTasks.filter(task => {
    const lastCompleted = task.lastCompleted ? new Date(task.lastCompleted.seconds * 1000) : null;
    return lastCompleted && lastCompleted.toDateString() === new Date().toDateString();
  }).length;

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
              <h2>Daily Tasks</h2>
              <p className="summary-value">{tasksCompletedToday}</p>
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
              Tasks & Achievements
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
              <>
                <div className="daily-tasks">
                  <h2 className="section-title">Your Daily Tasks</h2>
                  <div className="tasks-grid centered">
                    {dailyTasks.map(task => renderTaskCard(task))}
                  </div>
                </div>
                <div className="extended-tasks">
                  <h2 className="section-title">Extended Tasks</h2>
                  <div className="tasks-grid centered">
                    {achievements && achievements.length > 0 ? (
                      achievements.map(task => renderTaskCard(task, true))
                    ) : (
                      <p>No extended tasks available.</p>
                    )}
                  </div>
                </div>
              </>
            )}
            {activeTab === 'rewards' && (
              <div className="rewards-content centered">
                <h2 className="section-title">Available Rewards</h2>
                {redeemError && <p className="error">{redeemError}</p>}
                <div className="rewards-grid">
                  {rewards.map(reward => (
                    <div key={reward.id} className="reward-card">
                      <h3>{reward.name}</h3>
                      <p>{reward.description}</p>
                      <p className="points-cost">{reward.points} points</p>
                      <button 
                        onClick={() => handleRedeemReward(reward.id)}
                        disabled={userPoints < reward.points}
                        className="redeem-button"
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPage;