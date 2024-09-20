import React from 'react';

const StatsForm = ({ moodStats, moodOptions, factorOptions }) => {
  const { avgMoodScore, moodCounts, factorCounts } = moodStats;

  return (
    <div className="mood-statistics">
      <h2>Mood Statistics</h2>
      <p><strong>Average Mood Score:</strong> {avgMoodScore.toFixed(2)} / 5</p>
      
      <h3>Mood Distribution</h3>
      <ul>
        {moodOptions.filter(option => option.value).map(option => (
          <li key={option.value}>
            {option.emoji} {option.label}: {moodCounts[option.value] || 0}
          </li>
        ))}
      </ul>

      <h3>Factor Distribution</h3>
      <ul>
        {factorOptions.map(factor => (
          <li key={factor}>
            {factor}: {factorCounts[factor.toLowerCase()] || 0}
          </li>
        ))}
      </ul>

      <h3>Recommendations for Better Mood:</h3>
      <ul>
        <li>Practice daily gratitude by noting three things you're thankful for each day.</li>
        <li>Engage in regular physical exercise to boost endorphins and improve overall mood.</li>
        <li>Maintain a consistent sleep schedule to support emotional regulation.</li>
        <li>Practice mindfulness or meditation to reduce stress and improve emotional well-being.</li>
        <li>Connect with friends and loved ones regularly to foster social support.</li>
        <li>Engage in activities you enjoy to promote positive emotions.</li>
        <li>Set achievable goals and celebrate small victories to boost self-esteem.</li>
        <li>Practice self-compassion and avoid harsh self-criticism.</li>
        <li>Limit exposure to negative news and social media if it affects your mood.</li>
        <li>Seek professional help if you're consistently experiencing low mood or struggling to cope.</li>
      </ul>
    </div>
  );
};

export default StatsForm;