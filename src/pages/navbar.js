import React from 'react';
import logomind from '../images/logo mind.png'; 
import '../css/navbar.css'

const Navbar = () => {
  return (
    <header className="homepage-header">
      <div className="logo-container">
        <img src={logomind} alt="Mind Journey Logo" className="logo-image" />
        <div className="logo-text">MindJourney</div>
      </div>
      <div className="auth-buttons">
        <a href="/login" className="auth-button">Login</a>
        <a href="/register" className="auth-button">Sign Up</a>
      </div>
    </header>
  );
};

export default Navbar;
