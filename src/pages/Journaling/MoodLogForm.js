import React, { useEffect, useState } from 'react';
import { useAchievement } from '../../utils/achievementUtils';


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
  const { updateDailyTask, updateExtendedTask, getAchievementProgress, achievements } = useAchievement();
  const [journalStreak, setJournalStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get the current journal streak when the component mounts or achievements change
    setJournalStreak(getAchievementProgress('write_diary'));
  }, [getAchievementProgress, achievements]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      // First, save the mood log
      await handleSaveMood(event);

      // Then, update the daily task for journaling
      const dailyResult = await updateDailyTask('journal');
      
      // Update the extended task for the 30-day journaling streak (Diary Devotee)
      let extendedResult = { success: false };
      if (achievements.some(a => a.id === 'write_diary')) {
        extendedResult = await updateExtendedTask('write_diary');
      } else {
        console.warn("'write_diary' achievement not found. Skipping update.");
      }

      if (dailyResult.success) {
        const newStreak = getAchievementProgress('write_diary');
        setJournalStreak(newStreak);
        let message = `Mood log saved successfully!`;
        if (extendedResult.success) {
          message += ` Journal streak updated`;
          if (newStreak >= 30) {
            message += " Congratulations! You've completed the Diary Devotee achievement!";
          }
        }
        alert(message);
      } else {
        alert('Failed to update achievement. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting mood log:', error);
      alert('An error occurred while submitting the mood log. Please try again.');
    } finally {
      setIsLoading(false);
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
          required
        >
          <option value="">Select a mood</option>
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
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="diary-content">Diary Entry:</label>
        <textarea
          id="diary-content"
          value={diaryEntry}
          onChange={(e) => setDiaryEntry(e.target.value)}
          placeholder="Write your diary entry here..."
          rows="6"
          required
        />
      </div>
      <div className="achievement-progress">
        <h3>Diary Devotee Progress</h3>
        <p>{journalStreak}/30 days</p>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Mood'}
      </button>
    </form>
  );
};

export default MoodLogForm;