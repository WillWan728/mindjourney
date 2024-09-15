import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar2 from './navbar2';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import '../css/profiletracker.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({
    name: '',
    email: '',
    aboutMe: '',
    improvementReason: '',
    improvementPlan: '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUser({ 
            ...userDoc.data(), 
            email: auth.currentUser.email,
            name: userDoc.data().name || auth.currentUser.displayName || '',
            aboutMe: userDoc.data().aboutMe || '',
            improvementReason: userDoc.data().improvementReason || '',
            improvementPlan: userDoc.data().improvementPlan || ''
          });
        } else {
          setMessage({ text: 'User profile not found', type: 'error' });
        }
      } catch (err) {
        setMessage({ text: 'Error fetching user profile: ' + err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
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
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name: user.name,
        aboutMe: user.aboutMe,
        improvementReason: user.improvementReason,
        improvementPlan: user.improvementPlan,
      });
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Error updating profile: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      const credential = EmailAuthProvider.credential(
        user.email,
        passwords.current
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwords.new);
      
      setPasswords({ current: '', new: '', confirm: '' });
      setMessage({ text: 'Password updated successfully', type: 'success' });
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setMessage({ text: 'Current password is incorrect', type: 'error' });
      } else {
        setMessage({ text: 'Error updating password: ' + err.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = (field) => {
    return user[field] || `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  };

  const handleEditWellbeingGoals = () => {
    navigate('/wellbeingSetup');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!auth.currentUser) return <div className="error-message">Please log in to view your profile.</div>;

  return (
    <div className="profile-page">
      <Navbar2 />
      <div className="profile-tracker-container">
        <h1 className="main-title">Hi {user.name || 'there'}!</h1>
        {message.text && (
          <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </div>
        )}
        
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="profile-overview">
              <h2>About Me</h2>
              <p>{getPlaceholder('aboutMe')}</p>
              <h2>Wellbeing Aspirations</h2>
              <p>{getPlaceholder('improvementReason')}</p>
              <h2>My Plan</h2>
              <p>{getPlaceholder('improvementPlan')}</p>
              <div className="edit-wellbeing-button-container">
                <button 
                  onClick={handleEditWellbeingGoals} 
                  className="edit-wellbeing-button"
                >
                  Edit Well-being Goals
                </button>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={user.name} 
                  onChange={handleInputChange} 
                  placeholder="Please enter your name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={user.email} readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="aboutMe">About Me:</label>
                <textarea 
                  id="aboutMe" 
                  name="aboutMe" 
                  value={user.aboutMe} 
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="improvementReason">Wellbeing Aspirations:</label>
                <textarea 
                  id="improvementReason" 
                  name="improvementReason" 
                  value={user.improvementReason} 
                  onChange={handleInputChange}
                  placeholder="What are your wellbeing goals?"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="improvementPlan">My Plan:</label>
                <textarea 
                  id="improvementPlan" 
                  name="improvementPlan" 
                  value={user.improvementPlan} 
                  onChange={handleInputChange}
                  placeholder="How do you plan to achieve your wellbeing goals?"
                ></textarea>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>Save Changes</button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="current-password">Current Password:</label>
                <input 
                  type="password" 
                  id="current-password" 
                  name="current" 
                  value={passwords.current} 
                  onChange={handlePasswordChange} 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">New Password:</label>
                <input 
                  type="password" 
                  id="new-password" 
                  name="new" 
                  value={passwords.new} 
                  onChange={handlePasswordChange} 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password:</label>
                <input 
                  type="password" 
                  id="confirm-password" 
                  name="confirm" 
                  value={passwords.confirm} 
                  onChange={handlePasswordChange} 
                  required
                />
              </div>
              <button type="submit" className="submit-button" disabled={loading}>Change Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;