import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <>
            <nav className="navbar">
                <div className="navbar-logo">
                    <Link to="/">MindJourney</Link>
                </div>
                <ul className="navbar-links">
                    <li><Link to="/Fitness">Fitness</Link></li>
                    <li><Link to="/Sleeptracker">Sleep Tracker</Link></li>
                    <li><Link to="/mentalhealth">mental health</Link></li>
                    <li><Link to="/about">About Us</Link></li>
                </ul>
                <div className="navbar-auth">
                    <Link to="/login" className="signin-btn">Sign In</Link>
                    <Link to="/register" className="register-btn">Register</Link>
                </div>
            </nav>
        </>
    );
}