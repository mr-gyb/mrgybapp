import React, { useState } from 'react';
import { ChevronLeft, Save, Edit2, Plus, Trash2, Target, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const MarketingSales: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [sections, setSections] = useState({
    overview: {
      title: 'Marketing Overview',
      content: '',
      goals: [
        { id: '1', text: 'Increase market share by 20%' },
        { id: '2', text: 'Generate 1000 new leads' },
        { id: '3', text: 'Achieve 15% conversion rate' }
      ]
    },
    targetAudience: {
      title: 'Target Audience',
      demographics: '',
      psychographics: '',
      behaviors: '',
      painPoints: ''
    },
    strategies: {
      title: 'Marketing Strategies',
      digital: {
        title: 'Digital Marketing',
        channels: [
          { id: '1', name: 'Social Media', budget: 5000, goals: 'Increase engagement by 50%' },
          { id: '2', name: 'Email Marketing', budget: 3000, goals: 'Achieve 25% open rate' },
          { id: '3', name: 'SEO', budget: 4000, goals: 'Rank top 3 for key terms' }
        ]
      },
      traditional: {
        title: 'Traditional Marketing',
        channels: [
          { id: '1', name: 'Print Media', budget: 2000, goals: 'Local brand awareness' },
          { id: '2', name: 'Events', budget: 6000, goals: 'Generate 200 leads' }
        ]
      }
    },
    budget: {
      title: 'Marketing Budget',
      totalBudget: 20000,
      allocation: {
        digital: 12000,
        traditional: 8000
      }
    },
    timeline: {
      title: 'Implementation Timeline',
      quarters: [
        { id: 'Q1', activities: 'Launch social media campaign' },
        { id: 'Q2', activities: 'Email marketing automation' },
        { id: 'Q3', activities: 'SEO optimization' },
        { id: 'Q4', activities: 'Performance review' }
      ]
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
            <h1 className="text-3xl font-bold text-navy-blue">Marketing & Sales Plan</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            {isEditing ? <Save size={20} className="mr-2" /> : <Edit2 size={20} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Plan'}
          </button>
        </div>

        {/* Overview Section */}
        <div className="bg-gray-100 rounded-lg p-6 shadow-md mb-8">
          <div className="flex items-center mb-4">
            <Target size={24} className="mr-2 text-navy-blue" />
            <h2 className="text-2xl font-bold">{sections.overview.title}</h2>
          </div>
          {isEditing ? (
            <textarea
              value={sections.overview.content}
              onChange={(e) => handleSectionChange('overview', 'content', e.target.value)}
              className="w-full p-4 rounded-lg border border-gray-300 mb-4"
              rows={4}
              placeholder="Enter marketing overview..."
            />
          ) : (
            <p className="mb-4">{sections.overview.content || 'Add marketing overview...'}</p>
          )}
          <div className="space-y-2">
            <h3 className="font-semibold">Marketing Goals:</h3>
            {sections.overview.goals.map((goal) => (
              <div key={goal.id} className="flex items-center bg-white p-3 rounded-lg">
                <TrendingUp size={20} className="mr-2 text-green-500" />
                {isEditing ? (
                  <input
                    type="text"
                    value={goal.text}
                    onChange={(e) => {
                      const newGoals = sections.overview.goals.map(g =>
                        g.id === goal.id ? { ...g, text: e.target.value } : g
                      );
                      handleSectionChange('overview', 'goals', newGoals);
                    }}
                    className="flex-grow p-2 rounded border border-gray-300"
                  />
                ) : (
                  <span>{goal.text}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="bg-gray-100 rounded-lg p-6 shadow-md mb-8">
          <div className="flex items-center mb-4">
            <Users size={24} className="mr-2 text-navy-blue" />
            <h2 className="text-2xl font-bold">{sections.targetAudience.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sections.targetAudience)
              .filter(([key]) => key !== 'title')
              .map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 capitalize">{key}</h3>
                  {isEditing ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleSectionChange('targetAudience', key, e.target.value)}
                      className="w-full p-2 rounded border border-gray-300"
                      rows={3}
                    />
                  ) : (
                    <p>{value || `Add ${key} information...`}</p>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Marketing Strategies Section */}
        <div className="bg-gray-100 rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">{sections.strategies.title}</h2>
          <div className="space-y-6">
            {Object.entries(sections.strategies)
              .filter(([key]) => key !== 'title')
              .map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold mb-4 capitalize">{value.title}</h3>
                  <div className="space-y-4">
                    {value.channels.map((channel) => (
                      <div key={channel.id} className="border p-4 rounded-lg">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={channel.name}
                              onChange={(e) => {
                                const newChannels = value.channels.map(c =>
                                  c.id === channel.id ? { ...c, name: e.target.value } : c
                                );
                                handleSectionChange('strategies', key, {
                                  ...value,
                                  channels: newChannels
                                });
                              }}
                              className="font-semibold mb-2 w-full p-2 rounded border border-gray-300"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="number"
                                value={channel.budget}
                                onChange={(e) => {
                                  const newChannels = value.channels.map(c =>
                                    c.id === channel.id ? { ...c, budget: parseInt(e.target.value) } : c
                                  );
                                  handleSectionChange('strategies', key, {
                                    ...value,
                                    channels: newChannels
                                  });
                                }}
                                className="p-2 rounded border border-gray-300"
                              />
                              <input
                                type="text"
                                value={channel.goals}
                                onChange={(e) => {
                                  const newChannels = value.channels.map(c =>
                                    c.id === channel.id ? { ...c, goals: e.target.value } : c
                                  );
                                  handleSectionChange('strategies', key, {
                                    ...value,
                                    channels: newChannels
                                  });
                                }}
                                className="p-2 rounded border border-gray-300"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold">{channel.name}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <span className="text-gray-600">Budget:</span>
                                <span className="ml-2">${channel.budget}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Goals:</span>
                                <span className="ml-2">{channel.goals}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-gray-100 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">{sections.timeline.title}</h2>
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-navy-blue"></div>
            <div className="grid grid-cols-4 gap-4 pt-6">
              {sections.timeline.quarters.map((quarter) => (
                <div key={quarter.id} className="relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-4 h-4 bg-navy-blue rounded-full"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{quarter.id}</h4>
                    {isEditing ? (
                      <textarea
                        value={quarter.activities}
                        onChange={(e) => {
                          const newQuarters = sections.timeline.quarters.map(q =>
                            q.id === quarter.id ? { ...q, activities: e.target.value } : q
                          );
                          handleSectionChange('timeline', 'quarters', newQuarters);
                        }}
                        className="w-full p-2 rounded border border-gray-300"
                        rows={3}
                      />
                    ) : (
                      <p>{quarter.activities}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingSales;