import React from 'react';
import IntegrationCard from './IntegrationCard';
import { integrationCategories } from './integrationsList';

const IntegrationsGrid: React.FC = () => {
  return (
    <div className="space-y-8">
      {integrationCategories.map((category) => (
        <div key={category.title} className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.integrations.map((integration) => (
              <IntegrationCard key={integration.name} integration={integration} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntegrationsGrid;