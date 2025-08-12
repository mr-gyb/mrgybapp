import React from 'react';
import { Check, Star, Users, Globe, Zap, Building, ShoppingCart, FileText, Tag, Video, Calendar, Bot, Mail } from 'lucide-react';

interface ProCardProps {
  paymentType: 'monthly' | 'annually';
}

const ProCard: React.FC<ProCardProps> = ({ paymentType }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 flex-1 flex flex-col relative">
      {/* Recommended Badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
          Recommended
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Pro</h2>
        <p className="text-lg text-blue-600 font-medium">Boost your brand with Mr. GYB's Level 2, for budgets between $10k and $30k. Engage your audience effectively.</p>
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Content</h3>
        <p className="text-gray-600 text-base mb-4">
          Culture is ALL about building a brand. Building an online business requires an effective sales system that converts content-driven traffic into ready-to-buy leads.
        </p>
      </div>

      {/* Features */}
      <div className="space-y-4 mb-6">
        {/* Webinar/Challenge Funnel */}
        <div className="flex items-start space-x-3">
          <Video className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Webinar/Challenge Funnel</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Content drives traffic and engagement. Transform cold prospects into warm, ready-to-buy leads.
             </p>
          </div>
        </div>

        {/* SaaS BULK Offer Funnel */}
        <div className="flex items-start space-x-3">
          <Building className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">SaaS BULK Offer Funnel</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Educate and build rapport with your audience. Provide free value to attract and retain customers.
             </p>
          </div>
        </div>

        {/* Live Event Funnel */}
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Live Event Funnel</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Engage your audience with live events and interactive content.
             </p>
          </div>
        </div>

        {/* Recordings of Events */}
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
                             <h4 className="font-medium text-gray-900 text-base">Recordings of Events</h4>
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </div>
            </div>
                         <p className="text-sm text-gray-600 mt-1">
               Capture and repurpose your live content for ongoing value.
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

export default ProCard; 