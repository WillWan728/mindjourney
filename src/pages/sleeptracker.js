import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { createSleepLog, getSleepLogs, updateSleepLog, deleteSleepLog } from '../backend/sleep';
import { auth } from '../config/firebase';
import Navbar2 from './navbar2';
import '../css/sleep.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const calculateSleepDuration = (bedtime, waketime) => {
    // Convert both times to minutes since midnight
    const bedMinutes = bedtime.getHours() * 60 + bedtime.getMinutes();
    const wakeMinutes = waketime.getHours() * 60 + waketime.getMinutes();

    let duration;
    if (wakeMinutes < bedMinutes) {
        // Sleep crossed midnight
        duration = (24 * 60 - bedMinutes) + wakeMinutes;
    } else {
        // Sleep didn't cross midnight
        duration = wakeMinutes - bedMinutes;
    }

    // Convert duration from minutes to hours
    return duration / 60;
};

const SleepTracker = () => {
    const [user, setUser] = useState(null);
    const [sleepLog, setSleepLog] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
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
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sleepStats, setSleepStats] = useState({
        averageHours: 0,
        averageQuality: 0
    });

    const fetchSleepLogs = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const logs = await getSleepLogs(user.uid);
            setSleepLog(logs);
            calculateSleepStats(logs);
            setError(null);
        } catch (error) {
            console.error("Error fetching sleep logs: ", error);
            setError("Failed to fetch sleep logs. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const calculateSleepStats = (logs) => {
        if (logs.length === 0) return;

        const totalHours = logs.reduce((sum, log) => {
            const duration = calculateSleepDuration(log.bedtime, log.waketime);
            return sum + duration;
        }, 0);

        const totalQuality = logs.reduce((sum, log) => sum + log.quality, 0);

        setSleepStats({
            averageHours: (totalHours / logs.length).toFixed(2),
            averageQuality: (totalQuality / logs.length).toFixed(1)
        });
    };

    const getSleepAdvice = () => {
        const averageBedtime = new Date(sleepLog.reduce((sum, log) => sum + log.bedtime.getHours(), 0) / sleepLog.length * 3600000);
        const idealBedtime = new Date(22 * 3600000); // 10 PM

        if (averageBedtime > idealBedtime) {
            return "Try to sleep earlier, ideally around 10 PM, to improve your sleep quality.";
        } else if (sleepStats.averageHours < 7) {
            return "Aim for 7-9 hours of sleep per night to feel more rested.";
        } else if (sleepStats.averageQuality < 7) {
            return "To improve sleep quality, maintain a consistent sleep schedule and create a relaxing bedtime routine.";
        }
        return "Great job! Keep maintaining your current sleep habits.";
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchSleepLogs();
            } else {
                setLoading(false);
                setSleepLog([]);
            }
        });

        return () => unsubscribe();
    }, [fetchSleepLogs]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleYesterdayQuestions = (e) => {
        const { name, value } = e.target;
        setYesterdayQuestions(prevQuestions => ({ ...prevQuestions, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError("No user logged in");
            return;
        }

        const date = new Date(formData.date);
        const bedtime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
            parseInt(formData.bedtime.split(':')[0]), parseInt(formData.bedtime.split(':')[1]));
        const waketime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
            parseInt(formData.waketime.split(':')[0]), parseInt(formData.waketime.split(':')[1]));

        // If waketime is before bedtime, assume it's the next day
        if (waketime < bedtime) {
            waketime.setDate(waketime.getDate() + 1);
        }

        try {
            setLoading(true);
            const logData = {
                ...formData,
                ...yesterdayQuestions,
                bedtime,
                waketime
            };
            if (editingId) {
                await updateSleepLog(editingId, logData);
            } else {
                await createSleepLog(user.uid, logData);
            }
            setFormData({ date: new Date().toISOString().split('T')[0], bedtime: '', waketime: '', quality: '', notes: '' });
            setYesterdayQuestions({ feelRested: '', dreamed: '', wakeUps: '' });
            setEditingId(null);
            await fetchSleepLogs();
            setError(null);
        } catch (error) {
            console.error("Error saving sleep log: ", error);
            setError("Failed to save sleep log. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (log) => {
        setFormData({
            date: log.date.toLocaleDateString('en-CA'),
            bedtime: log.bedtime.toTimeString().slice(0, 5),
            waketime: log.waketime.toTimeString().slice(0, 5),
            quality: log.quality.toString(),
            notes: log.notes
        });
        setYesterdayQuestions({
            feelRested: log.feelRested ? 'yes' : 'no',
            dreamed: log.dreamed ? 'yes' : 'no',
            wakeUps: log.wakeUps.toString()
        });
        setEditingId(log.id);
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deleteSleepLog(id);
            await fetchSleepLogs();
            setError(null);
        } catch (error) {
            console.error("Error deleting sleep log: ", error);
            setError("Failed to delete sleep log. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getLastWeekData = () => {
        const lastWeek = sleepLog.slice(-7).reverse();
        return {
            labels: lastWeek.map(entry => entry.date.toLocaleDateString()),
            datasets: [{
                label: 'Sleep Quality',
                data: lastWeek.map(entry => entry.quality),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sleep Quality Over Time',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                title: {
                    display: true,
                    text: 'Sleep Quality'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please log in to use the Sleep Tracker.</div>;
    }

    return (
        <div className="sleep-tracker">
            <Navbar2 />
            <h1 className="page-title">Sleep Tracker</h1>
            {error && <div className="error-message">{error}</div>}
            
            <div className="container">
                <div className="feature-card">
                    <h2>Sleep Statistics</h2>
                    <p>Average Hours Slept: {sleepStats.averageHours}</p>
                    <p>Average Sleep Quality: {sleepStats.averageQuality}/10</p>
                    <h3>Sleep Improvement Advice</h3>
                    <p>{getSleepAdvice()}</p>
                </div>

                <div className="feature-card">
                    <h2>{editingId ? 'Edit Sleep Log' : 'Log Today\'s Sleep'}</h2>
                    <form onSubmit={handleSubmit} className="tracker-form">
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
                        <button type="submit" className="submit-button">{editingId ? 'Update Entry' : 'Save Entry'}</button>
                        {editingId && (
                            <button type="button" className="cancel-button" onClick={() => setEditingId(null)}>Cancel Edit</button>
                        )}
                    </form>
                </div>
                
                <div className="feature-card sleep-log">
                    <h2>Recent Sleep Logs</h2>
                    <ul className="log-list">
                        {sleepLog.slice(0, 3).map((entry) => (
                            <li key={entry.id}>
                                <h3>{entry.date.toLocaleDateString()}</h3>
                                <p>Bedtime: {entry.bedtime.toLocaleTimeString()} | Wake time: {entry.waketime.toLocaleTimeString()}</p>
                                <p>Quality: {entry.quality}/10 | Felt Rested: {entry.feelRested ? 'Yes' : 'No'} | Dreamed: {entry.dreamed ? 'Yes' : 'No'} | Wake-ups: {entry.wakeUps}</p>
                                <p>Notes: {entry.notes}</p>
                                <button onClick={() => handleEdit(entry)}>Edit</button>
                                <button onClick={() => handleDelete(entry.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="feature-card chart-container">
                    <h2>Sleep Quality Trend</h2>
                    <div style={{ height: '400px' }}>
                        <Line options={chartOptions} data={getLastWeekData()} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SleepTracker;