import React, { useState } from 'react';
import Navbar2 from './navbar2';
import '../css/mindfullness.css';

const MindfulExercisePage = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exercises = [
    {
      title: "Deep Breathing",
      description: "A simple technique to help you relax and focus on the present moment.",
      steps: [
        "Find a comfortable position, sitting or lying down.",
        "Close your eyes and take a deep breath in through your nose, counting to 4.",
        "Hold your breath for a count of 4.",
        "Exhale slowly through your mouth for a count of 4.",
        "Repeat this process for 5-10 minutes."
      ]
    },
    {
      title: "Body Scan Meditation",
      description: "A practice to increase awareness of your body and release tension.",
      steps: [
        "Lie down in a comfortable position.",
        "Close your eyes and focus on your breath for a few moments.",
        "Start to focus your attention on your toes, noticing any sensations.",
        "Slowly move your attention up through your body, focusing on each part.",
        "If you notice any tension, try to relax that area as you breathe out.",
        "Continue until you've scanned your entire body."
      ]
    },
    {
      title: "Mindful Walking",
      description: "A way to practice mindfulness while moving.",
      steps: [
        "Find a quiet place to walk, either indoors or outdoors.",
        "Begin walking at a natural pace.",
        "Focus on the sensation of walking - how your feet feel as they touch the ground.",
        "Notice the movement of your legs and the rest of your body as you walk.",
        "If your mind wanders, gently bring your attention back to the sensation of walking.",
        "Continue for 10-15 minutes."
      ]
    }
  ];

  return (
    <div className="mindful-exercise-page">
      <Navbar2 />
      <div className="mindful-exercise-container">
        <h1>Mindful Exercises</h1>
        <p>Explore these mindfulness exercises to help reduce stress and improve your overall wellbeing.</p>
        
        <div className="exercise-grid">
          {exercises.map((exercise, index) => (
            <div key={index} className="exercise-card" onClick={() => setSelectedExercise(exercise)}>
              <h3>{exercise.title}</h3>
              <p>{exercise.description}</p>
            </div>
          ))}
        </div>

        {selectedExercise && (
          <div className="exercise-details">
            <h2>{selectedExercise.title}</h2>
            <p>{selectedExercise.description}</p>
            <ol>
              {selectedExercise.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <button onClick={() => setSelectedExercise(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindfulExercisePage;