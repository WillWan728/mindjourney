import React from 'react';
import '../css/footer.css';
import logomind from '../images/logo mind.png'; // Import your logo image

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <img src={logomind} alt="Mind Journey Logo" className="footer-logo-image" />
                    <h2 className="footer-logo-text">MindJourney</h2>
                </div>
                <div className="footer-links">
                    <div className="footer-links-group">
                        <ul>
                            <li><a href="/Mission">Discover Our Mission</a></li>
                            <li><a href="/Support">Wellness Support</a></li>
                            <li><a href="/Contact">Contact Us</a></li>
                        </ul>
                    </div>
                    <div className="footer-links-group">
                        <ul>
                            <li><a href="/Terms">Terms and Conditions</a></li>
                            <li><a href="/homeaboutpage">About us</a></li>
                            <li><a href="Twitter">Twitter</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-contact">
                    <p>mindjourney@gmail.com</p>
                    <p>Helplines</p>
                </div>
            </div>
        </footer>
    );
}
