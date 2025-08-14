import React from 'react';
import { Check, Star, Users, Globe, Zap, Building, ShoppingCart, FileText, Tag } from 'lucide-react';

interface CultureCardProps {
  paymentType?: 'monthly' | 'annually';
}

const CultureCard: React.FC<CultureCardProps> = ({ paymentType = 'monthly' }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Startup</h2>
        <p className="text-lg text-blue-600 font-medium">Elevate your brand with Mr. GYB's Level 1, tailored for budgets under $10k.</p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-6">
        {paymentType === 'monthly' ? (
          <>
            <div className="text-4xl font-bold text-gray-900">$100</div>
            <div className="text-lg text-gray-600">/month</div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-900">$1000</div>
            <div className="text-lg text-gray-600">/year</div>
            <div className="text-base text-blue-600 mt-2">with last 2 months free</div>
            <div className="text-sm text-gray-500">(saving $200)</div>
          </>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Culture</h3>
        <p className="text-gray-600 text-base mb-4">
          Culture is ALL about building a brand. We focus on key deliverables to build a high ticket brand people can trust and rely on!
        </p>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-6">
        {/* Link Tree Funnel */}
        <div className="flex items-start space-x-3">
          <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Link Tree Funnel</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Your social media landing page. Host all your main services and offerings in one place.
            </p>
          </div>
        </div>

        {/* Personal Brand Funnel Hub */}
        <div className="flex items-start space-x-3">
          <Building className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-base">Personal Brand Funnel Hub</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Your main authority-building site. Showcase all your accolades, offers, brand story, and long-term vision.
            </p>
          </div>
        </div>

        {/* High Ticket Case Study Funnel */}
        <div className="flex items-start space-x-3">
          <Star className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-base">High Ticket Case Study Funnel</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Positions you as the premium option. Enables extensive advertising due to high ticket sales.
            </p>
          </div>
        </div>

        {/* Affiliate System */}
        <div className="flex items-start space-x-3">
          <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-base">Affiliate System</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Affiliate with us once your system is set up. Experience how easy it is to launch and grow.
            </p>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-lg">What's Included in Culture?</h4>
        <div className="space-y-2">
          {['Link Tree Funnel', 'Personal Brand Funnel Hub', 'High Ticket Case Study Funnel', 'Affiliate System'].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-base text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-lg">Bonus</h4>
        <div className="space-y-2">
          {[
            'Mr.GYB referral funnel',
            'Monthly cash flow (refer 3 get it free)',
            'Automated dms',
            'Automated emails',
            'Automated texts',
            'Automated Appointments'
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-base text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-auto pt-6">
        <button className="w-full bg-black text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200">
          GET STARTED
        </button>
      </div>
    </div>
  );
};

export default CultureCard; 