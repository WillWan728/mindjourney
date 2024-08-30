import React, { useState } from 'react';
import { Trophy, Star, Award, Target, BarChart2, Smile } from 'lucide-react';
import '../css/achievement.css'
import Navbar2 from './navbar2';

const AchievementCard = ({ title, icon: Icon, description, progress, total }) => (
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
  </div>
);

const Alert = ({ children }) => (
  <div className="alert flex items-center p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500">
    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
    <div>{children}</div>
  </div>
);

const AchievementsPage = () => {
  const [achievements] = useState([
    {
      title: "Consistent Journaler",
      icon: Trophy,
      description: "Write in your journal for 30 consecutive days",
      progress: 25,
      total: 30
    },
    {
      title: "Mood Master",
      icon: Star,
      description: "Track your mood for 50 days",
      progress: 35,
      total: 50
    },
    {
      title: "Fitness Fanatic",
      icon: Award,
      description: "Complete 20 workouts",
      progress: 15,
      total: 20
    },
    {
      title: "Sleep Champion",
      icon: Target,
      description: "Achieve 7+ hours of sleep for 14 nights",
      progress: 10,
      total: 14
    },
    {
      title: "Calorie Conscious",
      icon: BarChart2,
      description: "Track your calories for 30 days",
      progress: 18,
      total: 30
    },
    {
      title: "Wellbeing Warrior",
      icon: Smile,
      description: "Achieve higher than 70% wellbeing at least 5 times",
      progress: 3,
      total: 5
    }
  ]);

  return (
    <div className="achievements-page-container">
      <Navbar2 />
      <div className="dashboard-container">
        <div className="dashboard">
          <div className="dashboard-header">
            <h1 className="text-3xl font-bold mb-4">Your Achievements</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <AchievementCard key={index} {...achievement} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;