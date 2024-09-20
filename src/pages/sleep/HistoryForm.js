import React from 'react';

const HistoryForm = ({ sleepLogs, handleDeleteSleep }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="sleep-history">
      <h2>Sleep History</h2>
      {sleepLogs.length === 0 ? (
        <p>No sleep entries yet.</p>
      ) : (
        <ul className="history-list">
          {sleepLogs.map((log) => (
            <li key={log.id} className="history-item">
              <div className="history-content">
                <strong>{formatDate(log.date)}</strong>
                <br />
                Bedtime: {new Date(log.bedtime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                <br />
                Wake time: {new Date(log.waketime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                <br />
                Quality: {log.quality}/10
                <br />
                Felt Rested: {log.feelRested ? 'Yes' : 'No'}
                <br />
                Dreamed: {log.dreamed ? 'Yes' : 'No'}
                <br />
                Wake-ups: {log.wakeUps}
                {log.notes && <p className="history-notes">Notes: {log.notes}</p>}
              </div>
              <button 
                onClick={() => handleDeleteSleep(log.id)}
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