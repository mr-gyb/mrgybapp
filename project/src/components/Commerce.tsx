import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Commerce: React.FC = () => {
  const navigate = useNavigate();

  // Automatically redirect to dashboard when component mounts
  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  // Return null since we're redirecting immediately
  return null;
};

export default Commerce; 