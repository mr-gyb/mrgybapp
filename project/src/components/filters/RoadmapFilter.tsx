import React, { useState } from 'react';
import { Filter, X, FileText, PieChart, BarChart2, TrendingUp, Package, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const RoadmapFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const assets = [
    { id: 'businessplan', icon: FileText, label: 'Business Plan', path: '/templates/business-plan' },
    { id: 'investordeck', icon: PieChart, label: 'Investor Deck', path: '/templates/investor-deck' },
    { id: 'marketanalysis', icon: BarChart2, label: 'Market Analysis', path: '/templates/market-analysis' },
    { id: 'marketingsales', icon: TrendingUp, label: 'Marketing/Sales Plan', path: '/templates/marketing-sales' },
    { id: 'fulfilmentplan', icon: Package, label: 'Fulfilment Plan', path: '/templates/fulfilment-plan' },
    { id: 'mediaplan', icon: Film, label: 'Media Plan', path: '/templates/media-plan' }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isDarkMode ? 'bg-gold text-navy-blue' : 'bg-navy-blue text-white'} p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110`}
      >
        <Filter size={24} />
      </button>

      {isOpen && (
        <div className={`absolute bottom-16 right-0 ${isDarkMode ? 'bg-navy-blue/90' : 'bg-white'} rounded-lg shadow-xl p-6 w-80`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gold' : 'text-navy-blue'}`}>Assets</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleNavigate(asset.path)}
                className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-navy-blue/50 text-white' 
                    : 'hover:bg-gray-50 text-navy-blue'
                }`}
              >
                <asset.icon size={20} className={`mr-3 ${isDarkMode ? 'text-gold' : 'text-navy-blue'}`} />
                <span className="font-medium">{asset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapFilter;