import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/register.css';
import Navbar from './navbar';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log("Registration process started");

        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            console.log("Form validation failed: Missing fields");
            setError('All fields are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            console.log("Form validation failed: Passwords do not match");
            setError('Passwords do not match');
            return;
        }

        try {
            console.log("Creating user account");
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            console.log("User account created successfully", user.uid);

            console.log("Updating user profile");
            await updateProfile(user, {
                displayName: formData.username
            });
            console.log("User profile updated successfully");

            console.log("Creating user document in Firestore");
            await setDoc(doc(db, 'users', user.uid), {
                username: formData.username,
                email: formData.email,
                hasCompletedWellbeingSetup: false
            });
            console.log("User document created successfully");

            console.log("Registration process completed successfully");
            navigate('/wellbeingSetup');
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