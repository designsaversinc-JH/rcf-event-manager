import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  // Temporary review mode: bypass auth to let stakeholders explore admin screens.
  return children;

  // Keep existing guard logic below for easy rollback after review.
  // eslint-disable-next-line no-unreachable
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
