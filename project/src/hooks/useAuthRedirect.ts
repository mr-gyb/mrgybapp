import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // If user is authenticated and trying to access login/signin pages, redirect to home
      if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signin')) {
        navigate('/home', { replace: true });
      }
      
      // If user is not authenticated and trying to access protected routes, redirect to login
      if (!isAuthenticated && !['/login', '/signin', '/forgot-password', '/reset-password', '/onboarding', '/about', '/contact', '/what-to-expect', '/trial-signup', '/trial-signup-step2', '/trial-signup-confirmation'].includes(location.pathname)) {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  return { isAuthenticated, isLoading };
};
