import React from 'react';

export default function Navbar() {
    return (
        <>
            <div className="top-banner">
                <p>Track Your Wellness Journey</p>
            </div>
            <nav className="navbar">
                <div className="navbar-logo">
                    <a href="/">MindJourney</a>
                </div>
                <ul className="navbar-links">
                    <li><a href="/Fitness">Fitness</a></li>
                    <li><a href="/Sleeptracker">Sleep Tracker</a></li>
                    <li><a href="/Journalling">Journaling</a></li>
                </ul>
                <div className="navbar-auth">
                    <a href="/Signin" className="signin-btn">Sign In</a>
                    <a href="/register" className="register-btn">Register</a>
                </div>
            </nav>
        </>
    );
}
