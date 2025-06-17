import React, { useState } from 'react';
import SettingsPageTemplate from './SettingsPageTemplate';
import { Check, X, CreditCard } from 'lucide-react';

interface SubscriptionOption {
  level: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

const EmptySettingsPage: React.FC<{ title: string }> = ({ title }) => {
  const [isYearly, setIsYearly] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionOption | null>(null);

  const subscriptionOptions: SubscriptionOption[] = [
    {
      level: 1,
      monthlyPrice: 100,
      yearlyPrice: 1000,
      features: ['Basic Access', 'Limited Support']
    },
    {
      level: 2,
      monthlyPrice: 300,
      yearlyPrice: 3000,
      features: ['Enhanced Access', 'Priority Support', 'Advanced Analytics']
    },
    {
      level: 3,
      monthlyPrice: 500,
      yearlyPrice: 5000,
      features: ['Full Access', 'Dedicated Support', 'Custom Integrations']
    },
    {
      level: 4,
      monthlyPrice: 1000,
      yearlyPrice: 10000,
      features: ['Enterprise Access', '24/7 Support', 'White-label Solutions']
    }
  ];

  const handleSubscribe = (option: SubscriptionOption) => {
    setSelectedPlan(option);
    setShowOrderForm(true);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement order submission logic here
    console.log('Order submitted');
    setShowOrderForm(false);
    setSelectedPlan(null);
  };

  return (
    <SettingsPageTemplate title={title}>
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
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
              Yearly (2 months free)
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptionOptions.map((option) => (
            <div key={option.level} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <h3 className="text-2xl font-bold mb-4">Level {option.level}</h3>
              <p className="text-4xl font-bold mb-4">
                ${isYearly ? option.yearlyPrice : option.monthlyPrice}
                <span className="text-sm font-normal">/{isYearly ? 'year' : 'month'}</span>
              </p>
              <ul className="mb-6 flex-grow">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <Check size={20} className="text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(option)}
                className="bg-navy-blue text-white py-2 px-4 rounded-full hover:bg-opacity-90 transition duration-300"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <h4 className="text-xl font-bold mb-4">All plans include:</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-center">
              <Check size={20} className="text-green-500 mr-2" />
              Access to private community
            </li>
            <li className="flex items-center">
              <Check size={20} className="text-green-500 mr-2" />
              Online university access
            </li>
            <li className="flex items-center">
              <Check size={20} className="text-green-500 mr-2" />
              CRM system access
            </li>
            <li className="flex items-center">
              <Check size={20} className="text-green-500 mr-2" />
              Weekly Q&A coaching calls
            </li>
          </ul>
        </div>
      </div>

      {showOrderForm && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Complete Your Order</h2>
            <p className="mb-4">
              Level {selectedPlan.level} - ${isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}/{isYearly ? 'year' : 'month'}
            </p>
            <form onSubmit={handleSubmitOrder}>
              <div className="mb-4">
                <label htmlFor="cardNumber" className="block mb-2">Card Number</label>
                <div className="flex items-center border rounded-md">
                  <CreditCard size={20} className="ml-2 text-gray-400" />
                  <input
                    type="text"
                    id="cardNumber"
                    className="w-full p-2 rounded-md"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
              </div>
              <div className="flex mb-4">
                <div className="w-1/2 mr-2">
                  <label htmlFor="expiry" className="block mb-2">Expiry Date</label>
                  <input
                    type="text"
                    id="expiry"
                    className="w-full p-2 border rounded-md"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="w-1/2 ml-2">
                  <label htmlFor="cvv" className="block mb-2">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    className="w-full p-2 border rounded-md"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2">Name on Card</label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border rounded-md"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition duration-300"
                >
                  Complete Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SettingsPageTemplate>
  );
};

export default EmptySettingsPage;