import React from 'react';
import { Link } from 'react-router-dom';
import './css/mentalhealth.css';

const MentalHealthPage = () => {
  return (
    <div className="mental-health-container">
      <h1>Your Mental Health Journey</h1>
      <p>Explore our tools and resources to support your mental wellbeing.</p>
      
      <div className="feature-grid">
        <FeatureButton 
          to="/journaling" 
          icon="✏️" 
          title="Journaling"
          description="Daily prompts to inspire reflection and growth"
        />
        <FeatureButton 
          to="/mood-tracker" 
          icon="📊" 
          title="Mood Tracker"
          description="Log and visualize your emotional patterns"
        />
        <FeatureButton 
          to="/mindfulness" 
          icon="🧘" 
          title="Mindfulness Exercises"
          description="Guided meditations and breathing techniques"
        />
        <FeatureButton 
          to="/self-care" 
          icon="💖" 
          title="Self-Care Checklist"
          description="Prioritize your wellbeing with daily self-care goals"
        />
        <FeatureButton 
          to="/resources" 
          icon="📚" 
          title="Resource Library"
          description="Articles, helplines, and recommended readings"
        />
        <FeatureButton 
          to="/progress" 
          icon="🎯" 
          title="Progress Tracker"
          description="Set goals and celebrate your mental health journey"
        />
        <FeatureButton 
          to="/emotion-wheel" 
          icon="🎨" 
          title="Emotion Wheel"
          description="Identify and understand your emotions"
        />
      </div>
    </div>
  );
};

const FeatureButton = ({ to, icon, title, description }) => {
  return (
    <Link to={to} className="feature-button">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
};

export default MentalHealthPage;