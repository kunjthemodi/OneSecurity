import React, { useState} from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/Login.css';
import plane from '../assets/plane.png'; 
import smoke from '../assets/smoke.png'; 
import Header from "../pages/header";

export default function Login() {
  const [status, setStatus] = useState({ text: '', type: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const history = useHistory();

  const [loginSuccess, setLoginSuccess] = useState(false);
  const [landed, setLanded] = useState(false);


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
      setLoginSuccess(true);
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
  const handlePlaneAnimationEnd = e => {
    if (e.animationName === 'planeLand') {
      setLanded(true);
    }
  };



  return (
    <div className="login-page">
      <Header />

      <div className="hero-section relative overflow-visible">
      <img
        src={plane}
        className={`plane ${loginSuccess ? 'success' : ''} ${landed ? 'landed' : ''}`}
        alt="Flying plane"
        onAnimationEnd={handlePlaneAnimationEnd}
      />        
      <img src={smoke} 
      className={`smoke ${loginSuccess ? 'success' : ''} ${landed ? 'landed' : ''}`} 
      alt="Smoke behind"/>
      </div>
      <div className='loginhome'>
        <div className="info-section">
          <h1>Welcome to OneSecurity</h1>
          <p>Your all-in-one password manager designed to keep your credentials safe and accessible.</p>
          <ul>
            <li>🔒 End-to-end encryption: Your data is encrypted locally with AES-256.</li>
            <li>🛡️ Zero-knowledge architecture: We never store or see your master password.</li>
            <li>🔑 PBKDF2 with salt & pepper for secure password hashing.</li>
            <li>🌐 HTTPS with TLS 1.3 ensures secure data in transit.</li>
            <li>⚙️ Optional Two-Factor Authentication for extra protection.</li>
          </ul>
        </div>
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
        

      
      <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Kunj Modi. All rights reserved.</p>
      <p>Contact: <a href="mailto:kunjkumar.modi@ontariotechu.net">kunjkumar.modi@ontariotechu.net</a></p>
    </footer>
    </div>
  );
}