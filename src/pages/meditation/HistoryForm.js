import React from 'react';

const HistoryForm = ({ meditationLogs, handleDeleteMeditation }) => {
  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    return 'Invalid Date';
  };

  console.log("Received meditation logs in HistoryForm:", meditationLogs);

  return (
    <div className="history-container">
      <h2>Meditation History</h2>
      {meditationLogs.length === 0 ? (
        <p>No meditation entries yet.</p>
      ) : (
        <ul className="history-list">
          {meditationLogs.map(log => (
            <li key={log.id} className="history-item">
              <div className="history-content">
                <strong>{formatDate(log.date)}</strong> - {log.exercise}
                <br />
                Duration: {log.duration} minutes
                {log.notes && <p className="history-notes">Notes: {log.notes}</p>}
              </div>
              <button 
                onClick={() => handleDeleteMeditation(log.id)}
                className="delete-btn red-btn"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryForm;