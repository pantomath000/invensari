import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import StockPage from './pages/StockPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';
import Notification from './components/Notification';
import AuthGuard from './components/AuthGuard';
import logo from './logo.svg';

function App() {
  const [message, setMessage] = useState('');
  const location = useLocation(); // Track the current route
  const showMessage = (msg) => setMessage(msg);
  const clearMessage = () => setMessage('');

  // Define routes where the navbar should be hidden
  const hideNavbarRoutes = ['/', '/login', '/register', '/dashboard', '/stock', '/transactions', '/profile'];

  return (
    <div>
      <Notification message={message} clearMessage={clearMessage} />
      {/* Render the navbar only if the current path is not in hideNavbarRoutes */}
      {!hideNavbarRoutes.includes(location.pathname) && (
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/stock">Stock</Link></li>
            <li><Link to="/transactions">Transactions</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<LoginPage showMessage={showMessage} />} />
        <Route path="/register" element={<RegisterPage showMessage={showMessage} />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/stock" element={<AuthGuard><StockPage showMessage={showMessage} /></AuthGuard>} />
        <Route path="/transactions" element={<AuthGuard><TransactionsPage showMessage={showMessage} /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
      </Routes>
    </div>
  );
}

export default App;
