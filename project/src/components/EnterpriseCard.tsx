import React from 'react';
import { Check, Star, Users, Globe, Zap, Building, ShoppingCart, FileText, Tag, Video, Calendar, Bot, Mail, Crown, Users2, Shield } from 'lucide-react';

interface EnterpriseCardProps {
  paymentType: 'monthly' | 'annually';
}

const EnterpriseCard: React.FC<EnterpriseCardProps> = ({ paymentType }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Enterprise</h2>
        <p className="text-lg text-blue-600 font-medium">Level 3: Community. Elevate your brand with Mr. GYB's Level 3, for budgets between $30k and $60k. Enhance culture, content, and outreach affordably.</p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-6">
        {paymentType === 'monthly' ? (
          <>
            <div className="text-4xl font-bold text-gray-900">$300</div>
            <div className="text-lg text-gray-600">/month</div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-900">$3000</div>
            <div className="text-lg text-gray-600">/year</div>
            <div className="text-base text-blue-600 mt-2">with last 2 months free</div>
            <div className="text-sm text-gray-500">(saving $600)</div>
          </>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
        <p className="text-gray-600 text-base mb-4">
          Establish Your Own Platform. Now that you have a solid foundation with your culture and content system, it's time to host your own community.
        </p>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-6">
        {/* Build your own platform */}
        <div className="flex items-start space-x-3">
          <Crown className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Build your own platform for greater control</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Create a custom platform tailored to your brand and audience needs.
             </p>
          </div>
        </div>

        {/* Foster a dedicated community */}
        <div className="flex items-start space-x-3">
          <Users2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Foster a dedicated community around your brand</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Build and nurture a loyal community that supports your brand mission.
             </p>
          </div>
        </div>

        {/* Enhance direct engagement */}
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Enhance direct engagement with your audience</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Create meaningful connections and interactions with your community members.
             </p>
          </div>
        </div>

        {/* Strengthen brand loyalty */}
        <div className="flex items-start space-x-3">
          <Star className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Strengthen brand loyalty and influence</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Build lasting relationships that increase your brand's authority and reach.
             </p>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 text-lg">What's Included in Content?</h4>
         <div className="space-y-2">
           {['Webinar/Challenge Funnel', 'SaaS BULK Offer Funnel', 'Live Event Funnel', 'Recordings of Events'].map((item, index) => (
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
            '5 Al prompts for content Youtube title and scripts',
            'Hooks, story, and offer',
            'Automated Social Media Bots',
            'Automated Consent Scheduling',
            'Automated Blogs, Emails, etc.'
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

export default EnterpriseCard; 