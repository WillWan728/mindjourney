import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import '../css/login.css';
import Navbar from './navbar';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResetMessage('');

        if (!formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        try {
            // Firebase authentication for user login
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Check if user has completed wellbeing setup
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (!userData.hasCompletedWellbeingSetup) {
                    // Redirect to wellbeing setup if not completed
                    navigate('/wellbeingSetup');
                } else {
                    // Redirect to dashboard if wellbeing setup is completed
                    navigate('/dashboard');
                }
            } else {
                console.error('User document does not exist');
                setError('An error occurred. Please try again.');
            }

        } catch (error) {
            console.error('Login error:', error.code, error.message);
            setError(`Login failed: ${error.message}`);
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            setError('Please enter your email address');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, formData.email);
            setResetMessage('Password reset email sent. Please check your inbox.');
            setError('');
        } catch (error) {
            console.error('Password reset error:', error.code, error.message);
            setError(`Password reset failed: ${error.message}`);
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {resetMessage && <p className="success-message">{resetMessage}</p>}
                    <button type="submit" className="login-button">Login</button>
                </form>
                <button 
                    onClick={handleForgotPassword} 
                    className="forgot-password-button"
                >
                    Forgot Password?
                </button>
            </div>
        </div>
    );
};

export default Login;