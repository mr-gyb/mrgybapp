import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      className="px-4 py-2 rounded-full border border-[#1A2C42] text-[#1A2C42] font-medium hover:bg-gray-100"
      onClick={() => navigate('/login')}
    >
      Login
    </button>
  );
};

export default LoginButton;
