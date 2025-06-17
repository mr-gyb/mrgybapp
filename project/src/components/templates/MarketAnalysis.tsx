import React, { useState } from 'react';
import { ChevronLeft, Save, Edit2, TrendingUp, Users, Target, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MarketAnalysis: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState({
    marketOverview: {
      title: 'Market Overview',
      size: '',
      growth: '',
      trends: '',
      opportunities: ''
    },
    targetMarket: {
      title: 'Target Market Analysis',
      demographics: '',
      psychographics: '',
      behaviors: '',
      needs: ''
    },
    competition: {
      title: 'Competitive Analysis',
      directCompetitors: '',
      indirectCompetitors: '',
      strengths: '',
      weaknesses: ''
    },
    marketEntry: {
      title: 'Market Entry Strategy',
      barriers: '',
      strategy: '',
      timing: '',
      resources: ''
    },
    swotAnalysis: {
      title: 'SWOT Analysis',
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
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
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/road-map" className="mr-4 text-navy-blue">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-navy-blue">Market Analysis</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            {isEditing ? <Save size={20} className="mr-2" /> : <Edit2 size={20} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Analysis'}
          </button>
        </div>

        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="bg-gray-100 rounded-lg p-6 shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              {key === 'marketOverview' && <BarChart2 size={24} className="mr-2" />}
              {key === 'targetMarket' && <Users size={24} className="mr-2" />}
              {key === 'competition' && <Target size={24} className="mr-2" />}
              {key === 'marketEntry' && <TrendingUp size={24} className="mr-2" />}
              {section.title}
            </h2>
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
                        className="w-full p-2 rounded border border-gray-300"
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
                      className="w-full p-2 rounded border border-gray-300"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-600">{value || `Add ${field} information...`}</p>
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

export default MarketAnalysis;