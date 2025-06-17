import React, { useState } from 'react';
import { ChevronLeft, Save, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const BusinessPlan: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { isDarkMode } = useTheme();
  const [sections, setSections] = useState({
    overview: {
      title: 'Business Overview',
      content: '',
      mission: '',
      vision: '',
      goals: []
    },
    market: {
      title: 'Market Analysis',
      target: '',
      competition: '',
      opportunity: ''
    },
    strategy: {
      title: 'Business Strategy',
      model: '',
      pricing: '',
      marketing: '',
      sales: ''
    },
    operations: {
      title: 'Operations Plan',
      location: '',
      facilities: '',
      equipment: '',
      staff: ''
    },
    financials: {
      title: 'Financial Plan',
      startup: '',
      projections: '',
      funding: ''
    }
  });

  const handleSectionChange = (section: string, field: string, value: any) => {
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-navy-blue text-white' : 'bg-white text-navy-blue'}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/road-map" className={`mr-4 ${isDarkMode ? 'text-white' : 'text-navy-blue'}`}>
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">Business Plan</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`${isDarkMode ? 'bg-gold text-navy-blue' : 'bg-navy-blue text-white'} px-4 py-2 rounded-full flex items-center`}
          >
            {isEditing ? <Save size={20} className="mr-2" /> : <Edit2 size={20} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Plan'}
          </button>
        </div>

        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className={`${isDarkMode ? 'bg-navy-blue/50' : 'bg-gray-100'} rounded-lg p-6 shadow-md mb-6`}>
            <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            {Object.entries(section).map(([field, value]) => {
              if (field === 'title') return null;
              if (Array.isArray(value)) {
                return (
                  <div key={field} className="mb-4">
                    <h3 className="font-semibold mb-2 capitalize">{field}</h3>
                    {isEditing ? (
                      <textarea
                        value={value.join('\n')}
                        onChange={(e) => handleSectionChange(key, field, e.target.value.split('\n'))}
                        className={`w-full p-2 rounded border ${isDarkMode ? 'bg-navy-blue text-white border-gray-600' : 'bg-white border-gray-300'}`}
                        rows={4}
                      />
                    ) : (
                      <ul className="list-disc list-inside">
                        {value.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }
              return (
                <div key={field} className="mb-4">
                  <h3 className="font-semibold mb-2 capitalize">{field}</h3>
                  {isEditing ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleSectionChange(key, field, e.target.value)}
                      className={`w-full p-2 rounded border ${isDarkMode ? 'bg-navy-blue text-white border-gray-600' : 'bg-white border-gray-300'}`}
                      rows={4}
                    />
                  ) : (
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {value || `Add ${field} information...`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessPlan;