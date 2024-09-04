import React from 'react';
import { Link } from 'react-router-dom';
import logomind from '../images/logo mind.png';
import '../css/navbar.css';

const HomepageHeader = () => {
  return (
    <header className="homepage-header">
      <div className="header-content">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img src={logomind} alt="Mind Journey Logo" className="logo-image" />
            <div className="logo-text">MindJourney</div>
          </Link>
        </div>
        <div className="nav-links-container">
          <nav className="nav-links">
            {/* Add any navigation links here if needed */}
          </nav>
        </div>
        <div className="auth-buttons">
          <Link to="/login" className="auth-button login">Login</Link>
          <Link to="/register" className="auth-button register">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default HomepageHeader;