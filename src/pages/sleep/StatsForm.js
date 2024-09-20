import React from 'react';

const StatsForm = ({ sleepStats, sleepRecommendations }) => {
  const { avgDuration, avgQuality, avgBedtime, avgWaketime } = sleepStats;

  return (
    <div className="sleep-statistics">
      <h2>Sleep Statistics</h2>
      <p><strong>Average Sleep Duration:</strong> {avgDuration} hours</p>
      <p><strong>Average Sleep Quality:</strong> {avgQuality}/10</p>
      <p><strong>Average Bedtime:</strong> {avgBedtime ? avgBedtime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
      <p><strong>Average Wake Time:</strong> {avgWaketime ? avgWaketime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
      <h3>Recommendations for Better Sleep:</h3>
      <ul>
        {sleepRecommendations.map((recommendation, index) => (
          <li key={index}>{recommendation}</li>
        ))}
      </ul>
    </div>
  );
};

export default StatsForm;