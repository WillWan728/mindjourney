import React, { useState, useMemo } from 'react';
import Navbar2 from '../navbar2';
import SleepLogForm from './SleepLogForm';
import HistoryForm from './HistoryForm';
import StatsForm from './StatsForm';
import useSleepData from '../../hooks/sleepHooks';
import '../../css/sleep.css';

const SleepTracker = () => {
  const [activeTab, setActiveTab] = useState('log');
  const {
    user,
    loading,
    error,
    sleepLogs,
    sleepGoal,
    currentSleepDuration,
    sleepForm,
    setSleepForm,
    handleSleepSubmit,
    handleDeleteSleep,
    calculateSleepStatistics,
    generateSleepRecommendations
  } = useSleepData();

  const sleepStats = useMemo(() => calculateSleepStatistics(), [calculateSleepStatistics]);
  const sleepRecommendations = useMemo(() => generateSleepRecommendations(sleepStats), [generateSleepRecommendations, sleepStats]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to access the Sleep Tracker.</div>;

  return (
    <>
      <Navbar2 />
      <div className="sleep-tracker-container">
        <h1 className="main-title">Sleep Tracker</h1>
        {error && <div className="error-message">{error}</div>}
        
        <div className="sleep-goals">
          <p>Daily Sleep Goal: {currentSleepDuration.toFixed(1)} / {sleepGoal ? `${sleepGoal} hours` : '---'}</p>
        </div>
        
        <div className="tab-navigation">
          <button
            className={activeTab === 'log' ? 'active' : ''}
            onClick={() => setActiveTab('log')}
          >
            Log Sleep
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Sleep Stats
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'log' && (
            <div className="add-sleep-log">
              <SleepLogForm
                sleepForm={sleepForm}
                setSleepForm={setSleepForm}
                handleSleepSubmit={handleSleepSubmit}
                loading={loading}
              />
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="sleep-history">
              <HistoryForm
                sleepLogs={sleepLogs}
                handleDeleteSleep={handleDeleteSleep}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="sleep-statistics">
              <StatsForm
                sleepStats={sleepStats}
                sleepRecommendations={sleepRecommendations}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SleepTracker;