import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import logo from '../assets/cropped-Finn_Logo-2-1-260x49.png';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage('');
    if (!email || !password) {
      setMessage('Please enter both email and password.');
      return;
    }
    try {
      const res = await fetch('https://localhost:7246/api/Auth/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (data.token) {
        onLogin(data.token);
        setMessage('Login successful!');
        navigate('/');
      } else {
        setMessage('Login response does not contain a token.');
      }
    } catch (err) {
      setMessage('Login error: ' + err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Company Logo" className="login-logo" />
        <h2 className="login-title">Login</h2>
        
        <div className="login-form-group">
          <label className="login-label">Email</label>
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="login-form-group">
          <label className="login-label">Password</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="off"
          />
        </div>

        <button className="login-button" onClick={handleLogin}>Sign In</button>

        {message && <div className="login-message">{message}</div>}
      </div>
    </div>
  );
}

export default LoginPage;
