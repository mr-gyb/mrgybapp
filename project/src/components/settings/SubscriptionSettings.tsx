import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { DollarSign, Star, Users, TrendingUp, Check } from 'lucide-react';

const SubscriptionSettings: React.FC = () => {
  const { userData } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const subscriptionPlans = [
    {
      level: 1,
      name: 'Basic',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        'Basic AI chat access',
        'Limited content generation',
        'Standard support',
        'Basic analytics'
      ]
    },
    {
      level: 2,
      name: 'Pro',
      monthlyPrice: 79,
      yearlyPrice: 790,
      features: [
        'Advanced AI chat access',
        'Unlimited content generation',
        'Priority support',
        'Advanced analytics',
        'Custom integrations'
      ]
    },
    {
      level: 3,
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: [
        'Full AI team access',
        'Unlimited everything',
        'Dedicated support',
        'Custom solutions',
        'API access',
        'White-label options'
      ]
    }
  ];

  const handlePlanSelect = (level: number) => {
    setSelectedPlan(level);
    setShowOrderForm(true);
  };

  return (
    <SettingsPageTemplate title="Subscription Settings">
      <div className="space-y-8">
        {/* Current Plan */}
        <div className="bg-navy-blue text-white p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Current Plan</h2>
            <span className="px-3 py-1 bg-gold text-navy-blue rounded-full text-sm font-semibold">
              Level {userData?.subscriptionLevel || 1}
            </span>
          </div>
          <p className="text-gray-200 mb-4">
            Your subscription renews on the 1st of each month
          </p>
          <div className="flex items-center text-gold">
            <DollarSign size={24} className="mr-2" />
            <span className="text-2xl font-bold">
              {subscriptionPlans[(userData?.subscriptionLevel || 1) - 1]?.monthlyPrice}/mo
            </span>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 flex">
              <button
                className={`px-4 py-2 rounded-full ${!isYearly ? 'bg-navy-blue text-white' : 'text-gray-700'}`}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-full ${isYearly ? 'bg-navy-blue text-white' : 'text-gray-700'}`}
                onClick={() => setIsYearly(true)}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div key={plan.level} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  <span className="text-sm font-normal text-gray-600">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelect(plan.level)}
                  className={`w-full py-2 px-4 rounded-full ${
                    userData?.subscriptionLevel === plan.level
                      ? 'bg-green-500 text-white'
                      : 'bg-navy-blue text-white hover:bg-opacity-90'
                  }`}
                >
                  {userData?.subscriptionLevel === plan.level ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Plan Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Star className="text-yellow-400 mr-2" size={24} />
                <h3 className="text-lg font-semibold">AI Features</h3>
              </div>
              <ul className="space-y-2">
                <li>Chat with AI Team</li>
                <li>Content Generation</li>
                <li>Custom AI Training</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Users className="text-blue-500 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Team Features</h3>
              </div>
              <ul className="space-y-2">
                <li>Team Collaboration</li>
                <li>Role Management</li>
                <li>Shared Resources</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <TrendingUp className="text-green-500 mr-2" size={24} />
                <h3 className="text-lg font-semibold">Analytics</h3>
              </div>
              <ul className="space-y-2">
                <li>Performance Tracking</li>
                <li>Custom Reports</li>
                <li>Data Insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default SubscriptionSettings;