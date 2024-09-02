import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target, BarChart2, Smile } from 'lucide-react';
import '../css/achievement.css'
import Navbar2 from './navbar2';
import { getAchievements, createAchievement, updateAchievement, deleteAchievement } from '../backend/achievements';
import { auth } from '../config/firebase';

const AchievementCard = ({ title, icon: Icon, description, progress, total, onUpdate, onDelete }) => (
  <div className="achievement-card">
    <div className="card-header">
      <div className="flex items-center">
        <Icon className="mr-2 text-yellow-500" size={24} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
    <div className="card-content">
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div
            className="bg-yellow-500 h-2.5 rounded-full"
            style={{ width: `${(progress / total) * 100}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">{progress}/{total}</span>
      </div>
    </div>
    <div className="card-actions mt-2">
      <button onClick={onUpdate} className="text-blue-500 mr-2">Update</button>
      <button onClick={onDelete} className="text-red-500">Delete</button>
    </div>
  </div>
);

const Alert = ({ children }) => (
  <div className="alert flex items-center p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500">
    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
    <div>{children}</div>
  </div>
);

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const fetchedAchievements = await getAchievements(user.uid);
          setAchievements(fetchedAchievements);
        }
      } catch (err) {
        console.error("Error fetching achievements:", err);
        setError("Failed to load achievements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const handleCreateAchievement = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const newAchievement = {
          title: "New Achievement",
          description: "Description of the new achievement",
          category: "General",
          date: new Date().toISOString(),
          icon: "Trophy",
          points: 10,
          progress: 0,
          total: 100
        };
        const achievementId = await createAchievement(user.uid, newAchievement);
        setAchievements([...achievements, { id: achievementId, ...newAchievement }]);
      }
    } catch (err) {
      console.error("Error creating achievement:", err);
      setError("Failed to create achievement. Please try again.");
    }
  };

  const handleUpdateAchievement = async (id, updatedData) => {
    try {
      await updateAchievement(id, updatedData);
      setAchievements(achievements.map(ach => 
        ach.id === id ? { ...ach, ...updatedData } : ach
      ));
    } catch (err) {
      console.error("Error updating achievement:", err);
      setError("Failed to update achievement. Please try again.");
    }
  };

  const handleDeleteAchievement = async (id) => {
    try {
      await deleteAchievement(id);
      setAchievements(achievements.filter(ach => ach.id !== id));
    } catch (err) {
      console.error("Error deleting achievement:", err);
      setError("Failed to delete achievement. Please try again.");
    }
  };

  if (loading) return <div>Loading achievements...</div>;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div className="achievements-page-container">
      <Navbar2 />
      <div className="dashboard-container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h1 className="text-3xl font-bold mb-4">Your Achievements</h1>
            <button onClick={handleCreateAchievement} className="bg-blue-500 text-white px-4 py-2 rounded">
              Add New Achievement
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                {...achievement} 
                icon={Trophy} // You might want to dynamically select icons based on the achievement type
                onUpdate={() => handleUpdateAchievement(achievement.id, { progress: achievement.progress + 1 })}
                onDelete={() => handleDeleteAchievement(achievement.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;