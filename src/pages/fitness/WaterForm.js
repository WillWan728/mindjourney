import React from 'react';

const WaterForm = ({ waterForm, setWaterForm, handleWaterSubmit, loading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setWaterForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  return (
    <div className="water-log">
      <h2>Log Water Intake</h2>
      <form onSubmit={handleWaterSubmit} className="fitness-form">
        <div className="form-group">
          <label htmlFor="water-date">Date</label>
          <input 
            id="water-date"
            name="date"
            type="date" 
            value={waterForm.date || ''}
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
            value={waterForm.amount || ''}
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
            value={waterForm.time || ''}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label htmlFor="water-type">Type of Drink</label>
          <select
            id="water-type"
            name="type"
            value={waterForm.type || ''}
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
            value={waterForm.notes || ''}
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