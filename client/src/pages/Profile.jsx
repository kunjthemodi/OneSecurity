import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../components/Profile.css';

export default function Profile() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { accessToken, logout } = useAuth();
  const history = useHistory();

  useEffect(() => {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }, [accessToken]);

  const handleChange = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed!', { autoClose: 2000 });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Change failed', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
    window.location.reload();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Security Settings</h2>
        <button onClick={handleLogout} className="login-link mb-4 block text-right">
          Logout
        </button>
        <form onSubmit={handleChange} className="login-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={!currentPassword || !newPassword || loading}
            className="login-button"
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </form>
        <ToastContainer position="top-right" />
      </div>
    </div>
  );
}
