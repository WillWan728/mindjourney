import React, { useState } from 'react';
import Navbar2 from './navbar2';
import '../css/mindfullness.css';

const HealthyHabitsPage = () => {
  const [selectedHabit, setSelectedHabit] = useState(null);

  const habits = [
    {
      title: "Regular Exercise",
      description: "Incorporating regular physical activity into your daily routine.",
      steps: [
        "Start with 10-15 minutes of exercise daily.",
        "Gradually increase duration and intensity.",
        "Aim for at least 150 minutes of moderate aerobic activity per week.",
        "Include strength training exercises twice a week.",
        "Choose activities you enjoy to stay motivated."
      ]
    },
    {
      title: "Balanced Diet",
      description: "Maintaining a nutritious and well-balanced diet for overall health.",
      steps: [
        "Include a variety of fruits and vegetables in your meals.",
        "Choose whole grains over refined grains.",
        "Incorporate lean proteins like fish, poultry, and legumes.",
        "Limit processed foods and added sugars.",
        "Stay hydrated by drinking plenty of water throughout the day."
      ]
    },
    {
      title: "Quality Sleep",
      description: "Ensuring you get enough restful sleep each night.",
      steps: [
        "Establish a consistent sleep schedule.",
        "Create a relaxing bedtime routine.",
        "Make your bedroom conducive to sleep (dark, quiet, cool).",
        "Avoid screens for at least an hour before bed.",
        "Aim for 7-9 hours of sleep per night."
      ]
    }
  ];

  return (
    <div className="mindful-exercise-page">
      <Navbar2 />
      <div className="mindful-exercise-container">
        <h1>Healthy Habits</h1>
        <p>Discover these healthy habits to improve your overall wellbeing and lead a healthier lifestyle.</p>
        
        <div className="exercise-grid">
          {habits.map((habit, index) => (
            <div key={index} className="exercise-card" onClick={() => setSelectedHabit(habit)}>
              <h3>{habit.title}</h3>
              <p>{habit.description}</p>
            </div>
          ))}
        </div>

        {selectedHabit && (
          <div className="exercise-details">
            <h2>{selectedHabit.title}</h2>
            <p>{selectedHabit.description}</p>
            <ol>
              {selectedHabit.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <button onClick={() => setSelectedHabit(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthyHabitsPage;