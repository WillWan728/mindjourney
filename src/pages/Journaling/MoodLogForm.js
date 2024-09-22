import React from 'react';
import { useAchievement } from '../../utils/achievementUtils';
import { useNavigate } from 'react-router-dom';

const MoodLogForm = ({ 
  mood, 
  setMood, 
  factors, 
  handleFactorChange, 
  diaryTitle, 
  setDiaryTitle, 
  diaryEntry, 
  setDiaryEntry, 
  currentPrompt, 
  setRandomPrompt, 
  handleSaveMood, 
  moodOptions, 
  factorOptions 
}) => {
  const { updateDailyTask } = useAchievement();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      // First, save the mood log
      await handleSaveMood(event);

      // Then, update the daily task for journaling
      const result = await updateDailyTask('journal');
      if (result.success) {
        alert(`Mood log saved successfully! You earned ${result.pointsEarned} points.`);
        // Navigate to the achievements page
        navigate('/achievements');
      } else {
        alert(result.message || 'Failed to update achievement. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting mood log:', error);
      alert('An error occurred while submitting the mood log. Please try again.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="mood-form">
      <div className="form-group">
        <label htmlFor="mood-select">How are you feeling today?</label>
        <select 
          id="mood-select"
          value={mood} 
          onChange={(e) => setMood(e.target.value)}
        >
          {moodOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group factors-group">
        <label>Factors influencing your mood:</label>
        <div className="factors-grid">
          {factorOptions.map((factor) => (
            <label key={factor} className="factor-label">
              <input
                type="checkbox"
                value={factor.toLowerCase()}
                checked={factors.includes(factor.toLowerCase())}
                onChange={handleFactorChange}
              />
              {factor}
            </label>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="prompt">Reflection Prompt:</label>
        <p id="prompt" className="reflection-prompt">{currentPrompt}</p>
        <button type="button" onClick={setRandomPrompt} className="random-prompt-btn">
          Get New Prompt
        </button>
      </div>
      <div className="form-group">
        <label htmlFor="diary-title">Diary Entry Title:</label>
        <input
          type="text"
          id="diary-title"
          value={diaryTitle}
          onChange={(e) => setDiaryTitle(e.target.value)}
          placeholder="Enter a title for your diary entry"
        />
      </div>
      <div className="form-group">
        <label htmlFor="diary-content">Diary Entry:</label>
        <textarea
          id="diary-Entry"
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          placeholder="Write your diary entry here..."
          rows="6"
        />
      </div>
      <button type="submit">Save Mood</button>
    </form>
  );
};

export default MoodLogForm;