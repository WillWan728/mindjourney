import React, { useState, useEffect } from 'react';
import '../css/journaling.css';
import Navbar2 from './navbar2';

const Journaling = () => {
  const [prompt, setPrompt] = useState('');
  const [entry, setEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState([]);

  const prompts = [
    "What are three things you're grateful for today?",
    "Describe a challenge you're facing and three possible solutions.",
    "What's something you're looking forward to in the near future?",
    "Reflect on a recent accomplishment. How did it make you feel?",
    "Write about a person who has positively influenced your life recently.",
    "What's a goal you're working towards? What steps can you take to achieve it?",
    "Describe your ideal day. What would you do?",
    "What's a fear you'd like to overcome? How might you start facing it?",
    "Write about a recent act of kindness you witnessed or performed.",
    "What's something new you'd like to learn? Why does it interest you?"
  ];

  useEffect(() => {
    getRandomPrompt();
  }, []);

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setPrompt(prompts[randomIndex]);
  };

  const handleEntryChange = (e) => {
    setEntry(e.target.value);
  };

  const saveEntry = () => {
    if (entry.trim()) {
      const newEntry = {
        id: Date.now(),
        prompt: prompt,
        content: entry,
        date: new Date().toLocaleDateString()
      };
      setSavedEntries([newEntry, ...savedEntries]);
      setEntry('');
      getRandomPrompt();
    }
  };

  return (
    <>
      <Navbar2 />
      <div className="journaling-container">
        <h1>Journaling</h1>
        <div className="prompt-container">
          <h3>Today's Prompt:</h3>
          <p>{prompt}</p>
          <button onClick={getRandomPrompt} className="new-prompt-btn">Get New Prompt</button>
        </div>
        <div className="entry-container">
          <textarea
            value={entry}
            onChange={handleEntryChange}
            placeholder="Start writing your thoughts here..."
            rows="10"
          />
          <button onClick={saveEntry} className="save-entry-btn">Save Entry</button>
        </div>
        <div className="saved-entries">
          <h3>Previous Entries</h3>
          {savedEntries.map((savedEntry) => (
            <div key={savedEntry.id} className="saved-entry">
              <p className="entry-date">{savedEntry.date}</p>
              <p className="entry-prompt">{savedEntry.prompt}</p>
              <p className="entry-content">{savedEntry.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Journaling;