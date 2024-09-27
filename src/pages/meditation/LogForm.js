import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { MEDITATION_EXERCISES, INITIAL_MEDITATION_STATE } from '../../backend/meditation';

const LogForm = ({ user }) => {
  const [newMeditation, setNewMeditation] = useState(INITIAL_MEDITATION_STATE);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeditation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("User not authenticated");
      setMessage("Please log in to record a meditation.");
      return;
    }

    try {
      const meditationData = {
        ...newMeditation,
        userId: user.uid,
        date: serverTimestamp(),
      };

      await addDoc(collection(db, 'meditations'), meditationData);
      console.log("New meditation added successfully");
      setMessage("Meditation logged successfully!");
      setNewMeditation(INITIAL_MEDITATION_STATE);
    } catch (error) {
      console.error("Error adding meditation: ", error);
      setMessage("Failed to log meditation. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="meditation-form">
      <h2>Log Your Meditation</h2>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={newMeditation.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="duration">Duration (minutes):</label>
        <input
          type="number"
          id="duration"
          name="duration"
          value={newMeditation.duration}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="exercise">Exercise:</label>
        <select
          id="exercise"
          name="exercise"
          value={newMeditation.exercise}
          onChange={handleInputChange}
          required
        >
          <option value="">Select an exercise</option>
          {MEDITATION_EXERCISES.map(exercise => (
            <option key={exercise.title} value={exercise.title}>
              {exercise.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes:</label>
        <textarea
          id="notes"
          name="notes"
          value={newMeditation.notes}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit">Log Meditation</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
};

export default LogForm;