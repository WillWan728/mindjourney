import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../css/fitnesstracker.css';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FitnessTracker = () => {
    const [fitnessLog, setFitnessLog] = useState([]);
    const [formData, setFormData] = useState({
        date: '',
        activityType: '',
        duration: '',
        caloriesBurned: '',
        distance: '',
        notes: ''
    });
    const [bodyStats, setBodyStats] = useState({
        weight: '',
        height: '',
        bodyFat: ''
    });

    useEffect(() => {
        const storedLog = JSON.parse(localStorage.getItem('fitnessLog')) || [];
        setFitnessLog(storedLog);
        const storedStats = JSON.parse(localStorage.getItem('bodyStats')) || {};
        setBodyStats(storedStats);
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBodyStatsChange = (e) => {
        setBodyStats({ ...bodyStats, [e.target.name]: e.target.value });
        localStorage.setItem('bodyStats', JSON.stringify({ ...bodyStats, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newEntry = { ...formData };
        const updatedLog = [...fitnessLog, newEntry];
        setFitnessLog(updatedLog);
        localStorage.setItem('fitnessLog', JSON.stringify(updatedLog));
        setFormData({ date: '', activityType: '', duration: '', caloriesBurned: '', distance: '', notes: '' });
    };

    const getLastWeekData = () => {
        const lastWeek = fitnessLog.slice(-7);
        return {
            labels: lastWeek.map(entry => entry.date),
            datasets: [{
                label: 'Calories Burned',
                data: lastWeek.map(entry => entry.caloriesBurned),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
    };

    const calculateTotalCaloriesBurned = () => {
        return fitnessLog.reduce((acc, entry) => acc + parseInt(entry.caloriesBurned || 0), 0);
    };

    const calculateTotalWorkoutTime = () => {
        const totalMinutes = fitnessLog.reduce((acc, entry) => acc + parseInt(entry.duration || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    const calculateBMI = () => {
        if (!bodyStats.weight || !bodyStats.height) return 'N/A';
        const weightKg = parseFloat(bodyStats.weight);
        const heightM = parseFloat(bodyStats.height) / 100;
        return (weightKg / (heightM * heightM)).toFixed(1);
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Calories Burned Over Time',
            },
        },
    };

    return (
        <div className="fitness-tracker">
            <h1>Fitness Tracker</h1>
            
            <div className="dashboard">
                <div className="chart-container">
                    <Line options={chartOptions} data={getLastWeekData()} />
                </div>
                
                <div className="stats-container">
                    <div className="stat-box">
                        <h3>Total Calories Burned</h3>
                        <p>{calculateTotalCaloriesBurned()} kcal</p>
                    </div>
                    <div className="stat-box">
                        <h3>Total Workout Time</h3>
                        <p>{calculateTotalWorkoutTime()}</p>
                    </div>
                    <div className="stat-box">
                        <h3>BMI</h3>
                        <p>{calculateBMI()}</p>
                    </div>
                </div>
            </div>

            <div className="content-container">
                <div className="form-container">
                    <h2>Log Workout</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="date">Date:</label>
                            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="activityType">Activity Type:</label>
                            <select id="activityType" name="activityType" value={formData.activityType} onChange={handleInputChange} required>
                                <option value="">Select an activity</option>
                                <option value="running">Running</option>
                                <option value="cycling">Cycling</option>
                                <option value="swimming">Swimming</option>
                                <option value="weightlifting">Weightlifting</option>
                                <option value="yoga">Yoga</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="duration">Duration (minutes):</label>
                            <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="caloriesBurned">Calories Burned:</label>
                            <input type="number" id="caloriesBurned" name="caloriesBurned" value={formData.caloriesBurned} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="distance">Distance (km, if applicable):</label>
                            <input type="number" id="distance" name="distance" value={formData.distance} onChange={handleInputChange} step="0.01" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Notes:</label>
                            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} />
                        </div>
                        <button type="submit" className="submit-button">Save Workout</button>
                    </form>

                    <h2>Body Stats</h2>
                    <form>
                        <div className="form-group">
                            <label htmlFor="weight">Weight (kg):</label>
                            <input type="number" id="weight" name="weight" value={bodyStats.weight} onChange={handleBodyStatsChange} step="0.1" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="height">Height (cm):</label>
                            <input type="number" id="height" name="height" value={bodyStats.height} onChange={handleBodyStatsChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="bodyFat">Body Fat %:</label>
                            <input type="number" id="bodyFat" name="bodyFat" value={bodyStats.bodyFat} onChange={handleBodyStatsChange} step="0.1" />
                        </div>
                    </form>
                </div>

                <div className="fitness-log">
                    <h2>Workout Log</h2>
                    <ul>
                        {fitnessLog.map((entry, index) => (
                            <li key={index}>
                                <h3>{entry.date} - {entry.activityType}</h3>
                                <p><strong>Duration:</strong> {entry.duration} minutes</p>
                                <p><strong>Calories Burned:</strong> {entry.caloriesBurned} kcal</p>
                                {entry.distance && <p><strong>Distance:</strong> {entry.distance} km</p>}
                                {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FitnessTracker;