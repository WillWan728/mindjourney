import React, { useState } from 'react';
import Navbar2 from './navbar2';
import '../css/achievement.css';

const initialAchievements = [
  { id: 1, name: 'Fitness Fanatic', description: 'Complete a workout', points: 10, icon: '💪', progress: 0, total: 5 },
  { id: 2, name: 'Sleep Master', description: 'Log 7+ hours of sleep', points: 5, icon: '😴', progress: 2, total: 7 },
  { id: 3, name: 'Zen Master', description: 'Meditate for 10 minutes', points: 5, icon: '🧘', progress: 1, total: 5 },
  { id: 4, name: 'Reflective Writer', description: 'Write a journal entry', points: 5, icon: '✍️', progress: 3, total: 5 },
];

const moreActivities = [
  { id: 1, name: 'Close communication', description: 'Unravel the role of personal space through proxemics', points: 15, icon: '💬', locked: true },
  { id: 2, name: 'Tiny superfood', description: 'Unlock the benefits chia seeds - a nutritional powerhouse', points: 15, icon: '🥗', locked: true },
  { id: 3, name: 'Quote of the day', description: 'Start your day with a quote', points: 5, icon: '📜', locked: false },
  { id: 4, name: 'Mindful breathing', description: 'Practice deep breathing for 5 minutes', points: 10, icon: '🌸', locked: false },
  { id: 5, name: 'Healthy recipe', description: 'Try a new healthy recipe', points: 10, icon: '🍲', locked: false },
  { id: 6, name: 'Gratitude journal', description: 'Write down three things you\'re grateful for', points: 10, icon: '📔', locked: false },
];

const rewards = [
  { id: 1, name: 'Premium Meditation Pack', description: 'Unlock 30 premium guided meditations', points: 100, icon: '🧘' },
  { id: 2, name: 'Fitness Tracker', description: 'Receive a high-quality fitness tracking device', points: 500, icon: '⌚' },
  { id: 3, name: 'Healthy Cookbook', description: 'Digital cookbook with 100+ nutritious recipes', points: 200, icon: '📚' },
  { id: 4, name: 'Personal Coaching Session', description: '1-hour session with a wellness coach', points: 300, icon: '👨‍🏫' },
  { id: 5, name: 'Stress-Relief Kit', description: 'Collection of stress-relieving items', points: 150, icon: '🎁' },
  { id: 6, name: 'Sleep Improvement Course', description: 'Online course to enhance sleep quality', points: 250, icon: '💤' },
];

const AchievementCard = ({ achievement, onComplete }) => {
  const progressPercentage = (achievement.progress / achievement.total) * 100;
  
  return (
    <div className="achievement-card">
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <h3>{achievement.name}</h3>
        <p>{achievement.description}</p>
        <div className="progress-bar">
          <div className="progress" style={{width: `${progressPercentage}%`}}></div>
        </div>
        <p>{achievement.progress} / {achievement.total}</p>
        <p className="points">+{achievement.points} points</p>
      </div>
      <button onClick={() => onComplete(achievement.id, achievement.points)}>Complete</button>
    </div>
  );
};

const ActivityCard = ({ activity }) => (
  <div className={`activity-card ${activity.locked ? 'locked' : ''}`}>
    <div className="activity-icon">{activity.icon}</div>
    <div className="activity-info">
      <h3>{activity.name}</h3>
      <p>{activity.description}</p>
    </div>
    <div className="activity-points">+{activity.points}</div>
    {activity.locked && <div className="lock-icon">🔒</div>}
    {activity.locked ? (
      <p className="locked-message">Level 2 is required</p>
    ) : (
      <p className="points-message">{activity.points} points &gt;</p>
    )}
  </div>
);

const RewardCard = ({ reward, userPoints, onRedeem }) => (
  <div className="reward-card">
    <div className="reward-icon">{reward.icon}</div>
    <div className="reward-info">
      <h3>{reward.name}</h3>
      <p>{reward.description}</p>
      <p className="reward-points">{reward.points} points</p>
    </div>
    <button 
      onClick={() => onRedeem(reward.id, reward.points)} 
      disabled={userPoints < reward.points}
    >
      Redeem
    </button>
  </div>
);

const AchievementPage = () => {
  const [points, setPoints] = useState(245);
  const [completedTasks, setCompletedTasks] = useState(78);
  const [activeTab, setActiveTab] = useState('earn');

  const handleComplete = (id, earnedPoints) => {
    setPoints(prevPoints => prevPoints + earnedPoints);
    setCompletedTasks(prevTasks => prevTasks + 1);
  };

  const handleRedeem = (id, rewardPoints) => {
    if (points >= rewardPoints) {
      setPoints(prevPoints => prevPoints - rewardPoints);
      alert(`You have successfully redeemed the reward!`);
      // Here you would typically update the user's rewards in your backend
    } else {
      alert(`You don't have enough points to redeem this reward.`);
    }
  };

  return (
    <div className="achievement-page">
      <Navbar2 />
      <div className="achievement-content">
        <h1>Your Achievements</h1>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">{points}</span>
            <span className="stat-label">Total Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{completedTasks}</span>
            <span className="stat-label">Tasks Completed</span>
          </div>
        </div>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'earn' ? 'active' : ''}`}
            onClick={() => setActiveTab('earn')}
          >
            Earn
          </button>
          <button 
            className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
        </div>
        {activeTab === 'earn' && (
          <>
            <h2>Daily Tasks</h2>
            <div className="achievements-grid">
              {initialAchievements.map(achievement => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement}
                  onComplete={handleComplete}
                />
              ))}
            </div>
            <h2>More activities</h2>
            <div className="activities-grid">
              {moreActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </>
        )}
        {activeTab === 'rewards' && (
          <div className="rewards-section">
            <h2>Available Rewards</h2>
            <p>Redeem your points for these exciting rewards!</p>
            <div className="rewards-grid">
              {rewards.map(reward => (
                <RewardCard 
                  key={reward.id} 
                  reward={reward} 
                  userPoints={points}
                  onRedeem={handleRedeem}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPage;