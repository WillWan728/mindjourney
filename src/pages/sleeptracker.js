import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../css/sleep.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SleepTracker = () => {
    const [sleepLog, setSleepLog] = useState([]);
    const [formData, setFormData] = useState({
        date: '',
        bedtime: '',
        waketime: '',
        quality: '',
        notes: ''
    });
    const [yesterdayQuestions, setYesterdayQuestions] = useState({
        feelRested: '',
        dreamed: '',
        wakeUps: ''
    });

    useEffect(() => {
        const storedLog = JSON.parse(localStorage.getItem('sleepLog')) || [];
        setSleepLog(storedLog);
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleYesterdayQuestions = (e) => {
        setYesterdayQuestions({ ...yesterdayQuestions, [e.target.name]: e.target.value });
    };

    const calculateDuration = (bedtime, waketime) => {
        const start = new Date(`2000-01-01T${bedtime}:00`);
        const end = new Date(`2000-01-01T${waketime}:00`);
        
        if (end < start) {
            end.setDate(end.getDate() + 1);
        }
        
        const diff = end - start;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        return `${hours}h ${minutes}m`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const duration = calculateDuration(formData.bedtime, formData.waketime);
        const newEntry = { ...formData, duration, ...yesterdayQuestions };
        const updatedLog = [...sleepLog, newEntry];
        setSleepLog(updatedLog);
        localStorage.setItem('sleepLog', JSON.stringify(updatedLog));
        setFormData({ date: '', bedtime: '', waketime: '', quality: '', notes: '' });
        setYesterdayQuestions({ feelRested: '', dreamed: '', wakeUps: '' });
    };

    const getLastWeekData = () => {
        const lastWeek = sleepLog.slice(-7);
        return {
            labels: lastWeek.map(entry => entry.date),
            datasets: [{
                label: 'Sleep Quality',
                data: lastWeek.map(entry => entry.quality),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
    };

    const calculateAverageSleepQuality = () => {
        if (sleepLog.length === 0) return 'N/A';
        const sum = sleepLog.reduce((acc, entry) => acc + parseInt(entry.quality), 0);
        return (sum / sleepLog.length).toFixed(1);
    };

    const calculateAverageSleepDuration = () => {
        if (sleepLog.length === 0) return 'N/A';
        const totalMinutes = sleepLog.reduce((acc, entry) => {
            const [hours, minutes] = entry.duration.split('h ');
            return acc + parseInt(hours) * 60 + parseInt(minutes);
        }, 0);
        const avgMinutes = totalMinutes / sleepLog.length;
        const hours = Math.floor(avgMinutes / 60);
        const minutes = Math.round(avgMinutes % 60);
        return `${hours}h ${minutes}m`;
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sleep Quality Over Time',
            },
        },
    };

    return (
        <div className="sleep-tracker">
            <h1>Sleep Tracker</h1>
            
            <div className="dashboard">
                <div className="chart-container">
                    <Line options={chartOptions} data={getLastWeekData()} />
                </div>
                
                <div className="stats-container">
                    <div className="stat-box">
                        <h3>Average Sleep Quality</h3>
                        <p>{calculateAverageSleepQuality()}</p>
                    </div>
                    <div className="stat-box">
                        <h3>Average Sleep Duration</h3>
                        <p>{calculateAverageSleepDuration()}</p>
                    </div>
                </div>
            </div>

            <div className="content-container">
                <div className="form-container">
                    <h2>Log Today's Sleep</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="date">Date:</label>
                            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bedtime">Bedtime:</label>
                            <input type="time" id="bedtime" name="bedtime" value={formData.bedtime} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="waketime">Wake time:</label>
                            <input type="time" id="waketime" name="waketime" value={formData.waketime} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="quality">Sleep Quality (1-10):</label>
                            <input type="number" id="quality" name="quality" min="1" max="10" value={formData.quality} onChange={handleInputChange} required />
                        </div>

                        <h3>Questions about Yesterday's Sleep</h3>
                        <div className="form-group">
                            <label htmlFor="feelRested">Did you feel well-rested?</label>
                            <select id="feelRested" name="feelRested" value={yesterdayQuestions.feelRested} onChange={handleYesterdayQuestions} required>
                                <option value="">Select an option</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="dreamed">Did you dream?</label>
                            <select id="dreamed" name="dreamed" value={yesterdayQuestions.dreamed} onChange={handleYesterdayQuestions} required>
                                <option value="">Select an option</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="wakeUps">How many times did you wake up?</label>
                            <input type="number" id="wakeUps" name="wakeUps" min="0" value={yesterdayQuestions.wakeUps} onChange={handleYesterdayQuestions} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Notes about your sleep:</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} />
                        </div>

                        <button type="submit" className="submit-button">Save Entry</button>
                    </form>
                </div>

                <div className="sleep-log">
                    <h2>Sleep Log</h2>
                    <ul>
                        {sleepLog.map((entry, index) => (
                            <li key={index}>
                                <h3>{entry.date}</h3>
                                <p><strong>Duration:</strong> {entry.duration}</p>
                                <p><strong>Quality:</strong> {entry.quality}/10</p>
                                <p><strong>Felt Rested:</strong> {entry.feelRested}</p>
                                <p><strong>Dreamed:</strong> {entry.dreamed}</p>
                                <p><strong>Wake-ups:</strong> {entry.wakeUps}</p>
                                <p><strong>Notes:</strong> {entry.notes}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SleepTracker;