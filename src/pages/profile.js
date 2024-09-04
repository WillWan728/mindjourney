import React, { useState, useEffect } from 'react';
import Navbar2 from './navbar2';
import { auth } from '../config/firebase';
import { fetchUserProfile, updateUserProfile, updateUserPassword } from '../backend/profile';
import '../css/profiletracker.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState({
    name: '',
    email: '',
    goals: {
      calories: 2000,
      sleep: 8,
    },
    aboutMe: '',
    improvementReason: '',
    improvementPlan: '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      goals: {
        ...prevUser.goals,
        [name]: parseInt(value, 10)
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prevPasswords => ({
      ...prevPasswords,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(user);
      setError('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await updateUserPassword(passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
      setError('Password updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!auth.currentUser) return <div>Please log in to view your profile.</div>;

  return (
    <>
      <Navbar2 />
      <div className="profile-tracker-container">
        <h1 className="main-title">My Profile</h1>
        {error && <div className="error-message">{error}</div>}
        
        <div className="tab-navigation">
          <button 
            className={activeTab === 'personal' ? 'active' : ''} 
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button 
            className={activeTab === 'goals' ? 'active' : ''} 
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </button>
          <button 
            className={activeTab === 'wellbeing' ? 'active' : ''} 
            onClick={() => setActiveTab('wellbeing')}
          >
            Wellbeing
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''} 
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'personal' && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" value={user.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={user.email} readOnly />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>Save Changes</button>
            </form>
          )}

          {activeTab === 'goals' && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="calories">Daily Calorie Goal:</label>
                <input type="number" id="calories" name="calories" value={user.goals.calories} onChange={handleGoalChange} />
              </div>
              <div className="form-group">
                <label htmlFor="sleep">Daily Sleep Goal (hours):</label>
                <input type="number" id="sleep" name="sleep" value={user.goals.sleep} onChange={handleGoalChange} />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>Save Goals</button>
            </form>
          )}

          {activeTab === 'wellbeing' && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="aboutMe">About Me:</label>
                <textarea id="aboutMe" name="aboutMe" value={user.aboutMe} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="improvementReason">Why do you want to improve your wellbeing?</label>
                <textarea id="improvementReason" name="improvementReason" value={user.improvementReason} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="improvementPlan">How will you tackle your wellbeing improvement?</label>
                <textarea id="improvementPlan" name="improvementPlan" value={user.improvementPlan} onChange={handleInputChange}></textarea>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>Save Wellbeing Info</button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="current-password">Current Password:</label>
                <input type="password" id="current-password" name="current" value={passwords.current} onChange={handlePasswordChange} />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">New Password:</label>
                <input type="password" id="new-password" name="new" value={passwords.new} onChange={handlePasswordChange} />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password:</label>
                <input type="password" id="confirm-password" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>Change Password</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;