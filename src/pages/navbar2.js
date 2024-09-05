import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logomind from '../images/logo mind.png';
import '../css/navbar2.css';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase'; 

const Navbar2 = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar2">
      <div className="navbar-content">
        <div className="logo-container">
          <Link to="/dashboard" className="logo-link">
            <img src={logomind} alt="Mind Journey Logo" className="logo-image" />
            <span className="logo-text">MindJourney</span>
          </Link>
        </div>
        <div className="nav-links-container">
          <Link to="/fitness" className="nav-link">Fitness</Link>
          <Link to="/sleeptracker" className="nav-link">Sleep</Link>
          <Link to="/mindfulness" className="nav-link">Meditation</Link>
          <Link to="/wellbeing" className="nav-link">Wellbeing</Link>
          <Link to="/achievements" className="nav-link">Achievements</Link>
        </div>
        <div className="profile-container">
          <Link to="/profile" className="profile-button">Profile</Link>
          <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;