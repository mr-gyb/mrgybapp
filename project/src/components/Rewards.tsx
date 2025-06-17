import React from 'react';
import { ChevronLeft, Gift, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Reward {
  title: string;
  description: string;
  expiryDate: string;
}

const Rewards: React.FC = () => {
  const rewards: Reward[] = [
    {
      title: "Project Milestone Bonus",
      description: "Earn a 10% bonus for completing projects ahead of schedule",
      expiryDate: "2023-04-30"
    },
    {
      title: "Client Retention Reward",
      description: "$500 bonus for maintaining 5 long-term clients",
      expiryDate: "2023-05-15"
    },
    {
      title: "New Market Expansion",
      description: "$1000 bonus for acquiring a client in a new industry",
      expiryDate: "2023-06-30"
    }
  ];

  return (
    <div className="bg-navy-blue min-h-screen text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Rewards</h1>
        </div>

        <div className="space-y-4">
          {rewards.map((reward, index) => (
            <div key={index} className="bg-white text-navy-blue rounded-lg p-6">
              <div className="flex items-start">
                <Gift size={24} className="text-purple-500 mr-4 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">{reward.title}</h2>
                  <p className="text-lg mb-2">{reward.description}</p>
                  <div className="flex items-center text-gray-500">
                    <Clock size={16} className="mr-2" />
                    <span>Expires: {reward.expiryDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;