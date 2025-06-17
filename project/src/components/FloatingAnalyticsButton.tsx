import React from 'react';
import { BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingAnalyticsButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/gyb-studio');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 bg-navy-blue text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
    >
      <BarChart2 size={24} />
    </button>
  );
};

export default FloatingAnalyticsButton;