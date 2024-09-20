import React from 'react';

const HistoryForm = ({ savedMoods, handleDeleteMood, moodOptions }) => {
  return (
    <div className="mood-history">
      <h3>Mood History</h3>
      {savedMoods.length > 0 ? (
        savedMoods.map((savedMood) => (
          <div key={savedMood.id} className="saved-mood">
            <button onClick={() => handleDeleteMood(savedMood.id)} className="delete-mood-btn">Delete</button>
            <p className="mood-date">{new Date(savedMood.date).toLocaleDateString()}</p>
            <div className="mood-display">
              {moodOptions.find(option => option.value === savedMood.mood)?.emoji} {savedMood.mood} 
              (Score: {moodOptions.find(option => option.value === savedMood.mood)?.score.toFixed(1)})
            </div>
            <p className="mood-factors-list">Factors: {savedMood.factors.join(', ')}</p>
            <h4 className="diary-title">{savedMood.diaryTitle}</h4>
            <p className="diary-entry">{savedMood.diaryEntry}</p>
          </div>
        ))
      ) : (
        <p>No moods logged yet. Start tracking your moods to see your history here!</p>
      )}
    </div>
  );
};

export default HistoryForm;