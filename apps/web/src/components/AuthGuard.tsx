import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const token = localStorage.getItem('jwt');

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        return <Navigate to="/app" replace />;
      }
    } catch {
      return <Navigate to="/auth/login" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
