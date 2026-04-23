import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [page, setPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setPage('dashboard');
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setPage('login');
  };

  if (isLoggedIn && page === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="auth-wrapper">
      {page === 'login' ? (
        <Login onLogin={handleLogin} switchToRegister={() => setPage('register')} />
      ) : (
        <Register switchToLogin={() => setPage('login')} />
      )}
    </div>
  );
}

export default App;
