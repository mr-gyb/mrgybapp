import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      className="px-4 py-2 rounded-full bg-[#D9B45F] text-[#0A2342] font-medium hover:bg-[#C4A64D] transition-colors"
      onClick={() => navigate('/login')}
    >
      Login
    </button>
  );
};

export default LoginButton;
