import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && (location.pathname.startsWith('/auth') || location.pathname === '/landing')) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;