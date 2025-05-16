import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/Login.css';

export default function Login() {
  const [status, setStatus] = useState({ text: '', type: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const history = useHistory();

  const handleRegisterClick = e => {
    // let the <Link> do its navigation first...
    // then reload the page
    setTimeout(() => window.location.reload(), 0);
  };
  const clearStatus = () => {
    setTimeout(() => setStatus({ text: '', type: '' }), 3000);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      setStatus({ text: 'Login successful! Redirecting…', type: 'success' });
      clearStatus();
      setTimeout(() => {
        history.push('/dashboard');
      }, 1500);
    } catch (err) {
      setStatus({ text: err.response?.data?.message || 'Login failed', type: 'error' });
      clearStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">OneSecurity</h2>

        
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
          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!email.trim() || !password || loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {status.text && (
          <div className={`status-banner ${status.type}`}>
            {status.text}
          </div>
        )}
        <p className="login-footer">
          Don't have an account?{' '}
          <Link to="/register" className="login-link" onClick={handleRegisterClick}> 
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}