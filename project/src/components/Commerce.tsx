import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Commerce: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const pricingPlans = [
    {
      title: 'Basic',
      price: isAnnual ? '$16' : '$20',
      period: '/mo',
      savings: 'Save 36% annually',
      description: 'Create your own custom content and get discovered online. Upload videos, images, and documents for social media platforms.',
      recommended: false,
      features: [
        'Content Upload & Management',
        'Basic Analytics',
        'Social Media Integration',
        'AI Content Suggestions',
        'Community Access'
      ]
    },
    {
      title: 'Core',
      price: isAnnual ? '$23' : '$29',
      period: '/mo',
      savings: 'Save 36% annually',
      description: 'Unlock our full array of business features as you grow your content creation and community building.',
      recommended: true,
      features: [
        'Advanced Content Analytics',
        'Multi-Platform Publishing',
        'AI-Powered Content Generation',
        'Community Management Tools',
        'Culture & Brand Building',
        'Priority Support'
      ]
    },
    {
      title: 'Plus',
      price: isAnnual ? '$39' : '$49',
      period: '/mo',
      savings: 'Save 30% annually',
      description: 'Enjoy lower processing fees as your business grows with advanced commerce and monetization tools.',
      recommended: false,
      features: [
        'Advanced Commerce Tools',
        'Revenue Tracking',
        'Payment Processing',
        'Advanced Analytics',
        'Custom Branding',
        'API Access'
      ]
    },
    {
      title: 'Advanced',
      price: isAnnual ? '$99' : '$129',
      period: '/mo',
      savings: 'Save 28% annually',
      description: 'Maximize your revenue with our lowest processing fees and most advanced commerce, content, and community tools.',
      recommended: false,
      features: [
        'Enterprise Analytics',
        'White-label Solutions',
        'Custom Integrations',
        'Dedicated Support',
        'Advanced AI Features',
        'Multi-team Management'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl font-bold text-black mb-2">
          GYB Studio Platform
        </h1>
        <p className="text-lg text-black mb-8">
          Free for 14 days
        </p>
        
        {/* Payment Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-200 rounded-lg p-1 flex">
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                isAnnual 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pay annually
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !isAnnual 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pay monthly
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="relative bg-white rounded-lg shadow-lg p-6 border border-gray-100">
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-3 right-4 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Recommended
                </div>
              )}
              
              {/* Plan Title */}
              <h3 className="text-xl font-semibold text-black mb-4">
                {plan.title}
              </h3>
              
              {/* Price */}
              <div className="mb-2">
                <span className="text-3xl font-bold text-black">
                  {plan.price}
                </span>
                <span className="text-lg text-gray-600 ml-1">
                  {plan.period}
                </span>
              </div>
              
              {/* Savings */}
              <p className="text-sm text-blue-600 mb-4">
                {plan.savings}
              </p>
              
              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {plan.description}
              </p>

              {/* Features List */}
              <div className="mb-6">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Get Started Button */}
              <button className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
                GET STARTED
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">
            Platform Features
          </h2>
          <p className="text-gray-600">
            Everything you need to build your content, culture, and community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Content Tab */}
          <div 
            className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200 hover:shadow-md"
            onClick={() => navigate('/new-post')}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black">Content Creation</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Upload videos, images, and documents</li>
              <li>• AI-powered content analysis</li>
              <li>• Multi-platform publishing</li>
              <li>• Content performance tracking</li>
              <li>• Social media integration</li>
            </ul>
            <div className="mt-4 text-center">
              <span className="text-blue-600 text-sm font-medium">Click to explore →</span>
            </div>
          </div>

          {/* Culture Tab */}
          <div 
            className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200 hover:shadow-md"
            onClick={() => navigate('/new-chat')}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black">Culture & AI Chat</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• AI-powered conversations</li>
              <li>• Brand identity building</li>
              <li>• Team collaboration tools</li>
              <li>• Custom AI assistants</li>
              <li>• Chat history management</li>
            </ul>
            <div className="mt-4 text-center">
              <span className="text-purple-600 text-sm font-medium">Click to explore →</span>
            </div>
          </div>

          {/* Community Tab */}
          <div 
            className="bg-gray-50 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200 hover:shadow-md"
            onClick={() => navigate('/gyb-live-network')}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black">Community Network</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Network with other creators</li>
              <li>• Community feed & groups</li>
              <li>• User profiles & portfolios</li>
              <li>• Collaboration opportunities</li>
              <li>• Community analytics</li>
            </ul>
            <div className="mt-4 text-center">
              <span className="text-green-600 text-sm font-medium">Click to explore →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commerce; 