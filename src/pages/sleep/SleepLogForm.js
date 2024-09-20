import React from 'react';

const SleepLogForm = ({ sleepForm, setSleepForm, handleSleepSubmit, loading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSleepForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSleepSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="sleep-form">
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" value={sleepForm.date} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="bedtime">Bedtime:</label>
        <input type="time" id="bedtime" name="bedtime" value={sleepForm.bedtime} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="waketime">Wake time:</label>
        <input type="time" id="waketime" name="waketime" value={sleepForm.waketime} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="quality">Sleep Quality (1-10):</label>
        <input type="number" id="quality" name="quality" value={sleepForm.quality} onChange={handleChange} min="1" max="10" required />
      </div>
      <div className="form-group">
        <label htmlFor="feelRested">Feel Rested?</label>
        <select id="feelRested" name="feelRested" value={sleepForm.feelRested} onChange={handleChange}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="dreamed">Dreamed?</label>
        <select id="dreamed" name="dreamed" value={sleepForm.dreamed} onChange={handleChange}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="wakeUps">Number of Wake-ups:</label>
        <input type="number" id="wakeUps" name="wakeUps" value={sleepForm.wakeUps} onChange={handleChange} min="0" />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes:</label>
        <textarea id="notes" name="notes" value={sleepForm.notes} onChange={handleChange} placeholder="Any notes about your sleep?" />
      </div>
      <button type="submit" disabled={loading}>Save Sleep Log</button>
    </form>
  );
};

export default SleepLogForm;