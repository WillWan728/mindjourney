import React, { useState, useEffect } from 'react';
import { refreshAchievements } from '../utils/achivementUtils';
import { Trophy, Star, Award, Target, BarChart2, Smile, Book } from 'lucide-react';
import Navbar2 from './navbar2'; 
import '../css/achievement.css';

const AchievementCard = ({ title, icon: Icon, description, progress, total }) => (
  <div className="achievement-card">
    <div className="card-header">
      <div className="icon-title">
        <Icon className="achievement-icon" size={24} />
        <h3 className="card-title">{title}</h3>
      </div>
    </div>
    <div className="card-content">
      <p className="card-description">{description}</p>
      <div className="progress-bar">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(progress / total) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">{progress}/{total}</span>
      </div>
    </div>
  </div>
);

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedAchievements = await refreshAchievements();
        console.log("Fetched achievements:", fetchedAchievements); // Debug log
        setAchievements(fetchedAchievements);
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load achievements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const getIcon = (id) => {
    switch (id) {
      case "mood-master": return Star;
      case "fitness-fanatic": return Award;
      case "sleep-champion": return Target;
      case "calorie-conscious": return BarChart2;
      case "wellbeing-warrior": return Smile;
      case "journaling-journey": return Book;
      default: return Trophy;
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar2 />
      <div className="achievements-page-container">
        <div className="dashboard-container">
          <div className="dashboard">
            <div className="dashboard-header">
              <h1>Your Achievements</h1>
            </div>
            {loading && <div className="loading">Loading achievements...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && achievements.length === 0 && (
              <div className="no-achievements">No achievements found. Start using the app to earn achievements!</div>
            )}
            {!loading && !error && achievements.length > 0 && (
              <div className="achievements-grid">
                {achievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    {...achievement} 
                    icon={getIcon(achievement.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;