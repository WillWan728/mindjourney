import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/register.css';
import Navbar from './navbar';
import { auth } from '../config/firebase'; 
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const RegisterUser = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // In RegisterUser component
const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('All fields are required');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    try {
        // Firebase authentication for user registration
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Update the user's profile with the username
        await updateProfile(user, {
            displayName: formData.username
        });

        console.log('User registered successfully', user);
        // Redirect to dashboard after successful registration
        navigate('/dashboard', { state: { username: formData.username } });
    } catch (error) {
        console.error('Registration error:', error.code, error.message);
        setError(`Registration failed: ${error.message}`);
    }
};
    return (
        <div className="register-page">
            <Navbar />
            <div className="register-container">
                <h2>Create an Account</h2>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
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
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="register-button">Register</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterUser;
