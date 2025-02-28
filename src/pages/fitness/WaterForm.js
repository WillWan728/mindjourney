import React, { useState } from 'react';
import { useAchievement } from '../../utils/achievementUtils';
import { useNavigate } from 'react-router-dom';

const WaterForm = () => {
  const { logWaterIntake, userPoints, loading } = useAchievement();
  const navigate = useNavigate();

  const [waterForm, setWaterForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    time: '',
    type: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaterForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await logWaterIntake(waterForm);
      console.log('logWaterIntake result:', result);

      if (result.success) {
        const updatedProgress = result.achievementUpdateResult.progress;
        console.log('Updated achievement progress:', updatedProgress);

        if (updatedProgress >= 7) {
          alert(`Congratulations! You've logged your water intake `);
          navigate('/achievements');
        } else {
          alert(`Water intake logged successfully! Current progress: ${updatedProgress}/7 days. Your current points: ${userPoints}`);
        }

        // Reset form after successful submission
        setWaterForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          time: '',
          type: '',
          notes: ''
        });
      } else {
        console.error('Failed to log water intake:', result.message);
        alert(`Failed to log water intake. Please try again later. Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting water intake:', error);
      alert(`An error occurred while submitting the water intake: ${error.message}. Please try again.`);
    }
  };

  return (
    <div className="water-log">
      <h2>Log Water Intake</h2>
      <form onSubmit={onSubmit} className="fitness-form">
        <div className="form-group">
          <label htmlFor="water-date">Date</label>
          <input 
            id="water-date"
            name="date"
            type="date" 
            value={waterForm.date}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="water-amount">Amount (ml)</label>
          <input 
            id="water-amount"
            name="amount"
            type="number" 
            value={waterForm.amount}
            onChange={handleChange}
            placeholder="Water amount in ml" 
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="water-time">Time</label>
          <input 
            id="water-time"
            name="time"
            type="time" 
            value={waterForm.time}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="water-type">Type of Drink</label>
          <select
            id="water-type"
            name="type"
            value={waterForm.type}
            onChange={handleChange}
            required
          >
            <option value="">Select drink type</option>
            <option value="water">Water</option>
            <option value="tea">Tea</option>
            <option value="coffee">Coffee</option>
            <option value="juice">Juice</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="water-notes">Notes (optional)</label>
          <textarea 
            id="water-notes"
            name="notes"
            value={waterForm.notes}
            onChange={handleChange}
            placeholder="Any additional notes" 
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Adding...' : 'Add Water Intake'}
        </button>
      </form>
    </div>
  );
};

export default WaterForm;