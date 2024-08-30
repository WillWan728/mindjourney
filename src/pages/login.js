import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login.css';
import Navbar from './navbar';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginUser = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
            console.log('User logged in successfully', user);
            navigate('/dashboard', { state: { username: user.displayName || user.email } });
        } catch (error) {
            console.error('Login error:', error.code, error.message);
            setError(`Login failed: ${error.message}`);
        }
    };

    return (
        <div className="login-page">
            <Navbar />
            <div className="login-container">
                <h2>Login to Your Account</h2>
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
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginUser;