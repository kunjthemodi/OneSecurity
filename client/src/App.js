// src/App.js
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// PrivateRoute ensures auth-protected routes
function PrivateRoute({ children, ...rest }) {
  const { accessToken } = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        accessToken ? (
          children
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: location } }} />
        )
      }
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      
      <Router>
        {/* Single ToastContainer for all toast notifications */}
    

        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <PrivateRoute exact path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute exact path="/profile">
            <Profile />
          </PrivateRoute>
          {/* Redirect any unknown route to login */}
          <Redirect to="/login" />
        </Switch>
      </Router>
    </AuthProvider>
  );
}
