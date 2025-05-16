// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

// Helper to decode JWT payload
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(window.atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(accessToken ? decodeToken(accessToken) : null);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      setUser(decodeToken(accessToken));
    } else {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, [accessToken]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
  };

  const register = async (email, password) => {
    await api.post('/auth/register', { email, password });
  };

  const logout = () => {
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
