import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');  // Retrieve userId directly here
    if (!userId) {
      navigate('/login');  // Redirect to login if user is not authenticated
    }
  }, [navigate]);

  // Check for user ID again to ensure rendering only if authenticated
  const userId = localStorage.getItem('userId');
  return userId ? children : null;
};

export default AuthGuard;
