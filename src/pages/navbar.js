import React from 'react';
import { Link } from 'react-router-dom';
import logomind from '../images/logo mind.png';
import '../css/navbar.css';

const Navbar = () => {
  return (
    <header className="homepage-header">
      <div className="logo-container">
        <img src={logomind} alt="Mind Journey Logo" className="logo-image" />
        <span className="logo-text">MindJourney</span>
      </div>
      <div className="auth-buttons">
        <Link to="/login" className="auth-link"><span>Login</span></Link>
        <Link to="/register" className="auth-link"><span>Register</span></Link>
      </div>
    </header>
  );
};

export default Navbar;