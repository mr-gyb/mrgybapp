import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // if loading then spinner 
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  // if the route needs to have a account but user didn't sign in
  if (requireAuth && !isAuthenticated) {
    // stores the current state and after log in navigate to that state.
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // if user already signed up tries to access to the onboarding router
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/homepage" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
