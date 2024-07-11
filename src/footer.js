import React from 'react';

export default function Footer() {
    console.log("Footer component rendered");
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <h2>MindJourney</h2>
                </div>
                <div className="footer-links">
                    <ul>
                        <li><a href="/Mission">Discover Our Mission</a></li>
                        <li><a href="/Support">Wellness Support</a></li>
                        <li><a href="/Contact">Contact Us</a></li>
                        <li><a href="/Terms">Terms and Conditions</a></li>
                        <li><a href="Instagram">Instagram</a></li>
                        <li><a href="Twitter">Instagram</a></li>
                    </ul>
                </div>
                <div className="footer-contact">
                    <p>mindjourney@gmail.com</p>
                    <p>Helplines</p>
                </div>
            </div>
        </footer>
    );
}