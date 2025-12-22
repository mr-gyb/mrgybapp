import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignupButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      className="px-4 py-2 rounded-full bg-[#1A2C42] text-white font-medium hover:bg-[#0A1929]"
      onClick={() => navigate('/signup')}
    >
      Sign Up
    </button>
  );
};

export default SignupButton;
