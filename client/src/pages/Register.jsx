// src/pages/Register.jsx
import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/Register.css';

export default function Register() {
  const [status, setStatus] = useState({ text: '', type: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const history = useHistory();
  
  const clearStatus = () => {
    setTimeout(() => setStatus({ text: '', type: '' }), 3000);
  };
  const handleLoginClick = e => {
    // let the <Link> do its navigation first...
    // then reload the page
    setTimeout(() => window.location.reload(), 0);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email.trim(), password);
      setStatus({ text: 'Registration successful! Redirecting…', type: 'success' });
      clearStatus();
      setTimeout(() => {
        history.push('/login');
        window.location.reload();
      }, 1500);
    } catch (err) {
      setStatus({ text: err.response?.data?.message || 'Registration failed', type: 'error' });
      clearStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-home">
      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!email.trim() || !password || loading}
            className="login-button"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {status.text && (
          <div className={`status-banner ${status.type}`}>
            {status.text}
          </div>
        )}
        <p className="login-footer">
          Have an account?{' '}
          <Link to="/login" className="login-link" onClick={handleLoginClick}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}