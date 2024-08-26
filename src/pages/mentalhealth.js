import React from 'react';
import { Link } from 'react-router-dom';
import '../css/mentalhealth.css'

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
          to="/moodtracker" 
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
        to="/extra"
        icon= "👌"
        title="Wellbeing support links"
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