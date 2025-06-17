import React, { useState } from 'react';
import { ChevronLeft, Copy, ExternalLink, DollarSign, Users, BarChart2, Settings, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Invites: React.FC = () => {
  const [affiliateLink, setAffiliateLink] = useState('https://gybai.com/ref/user123');
  const [customLinkSuffix, setCustomLinkSuffix] = useState('');
  const [showLinkCustomization, setShowLinkCustomization] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [payoutThreshold, setPayoutThreshold] = useState(100);

  const metrics = {
    clicks: 1250,
    signUps: 75,
    totalEarnings: 1500,
  };

  const referralData = [
    { name: 'Mon', referrals: 5 },
    { name: 'Tue', referrals: 8 },
    { name: 'Wed', referrals: 12 },
    { name: 'Thu', referrals: 7 },
    { name: 'Fri', referrals: 10 },
    { name: 'Sat', referrals: 15 },
    { name: 'Sun', referrals: 9 },
  ];

  const conversionData = [
    { name: 'Week 1', rate: 2.5 },
    { name: 'Week 2', rate: 3.2 },
    { name: 'Week 3', rate: 2.8 },
    { name: 'Week 4', rate: 3.5 },
  ];

  const recentReferrals = [
    { id: 1, user: 'johndoe@example.com', date: '2023-04-15', status: 'Signed Up' },
    { id: 2, user: 'janedoe@example.com', date: '2023-04-14', status: 'Clicked' },
    { id: 3, user: 'bobsmith@example.com', date: '2023-04-13', status: 'Purchased' },
  ];

  const payoutHistory = [
    { id: 1, date: '2023-03-31', amount: 250 },
    { id: 2, date: '2023-02-28', amount: 180 },
    { id: 3, date: '2023-01-31', amount: 320 },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    alert('Affiliate link copied to clipboard!');
  };

  const handleCustomLinkGeneration = () => {
    if (customLinkSuffix) {
      setAffiliateLink(`https://gybai.com/ref/${customLinkSuffix}`);
      setShowLinkCustomization(false);
      setCustomLinkSuffix('');
    }
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Affiliate Dashboard</h1>
        </div>

        {/* Affiliate Link Section */}
        <div className="bg-navy-blue text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Your Affiliate Link</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={affiliateLink}
              readOnly
              className="flex-grow bg-white text-navy-blue px-4 py-2 rounded"
            />
            <button
              onClick={handleCopyLink}
              className="bg-gold text-navy-blue px-4 py-2 rounded flex items-center"
            >
              <Copy size={20} className="mr-2" />
              Copy
            </button>
          </div>
          <button
            onClick={() => setShowLinkCustomization(!showLinkCustomization)}
            className="mt-2 text-gold hover:underline"
          >
            Customize Link
          </button>
          {showLinkCustomization && (
            <div className="mt-4">
              <input
                type="text"
                value={customLinkSuffix}
                onChange={(e) => setCustomLinkSuffix(e.target.value)}
                placeholder="Enter custom link suffix"
                className="mr-2 px-4 py-2 rounded text-navy-blue"
              />
              <button
                onClick={handleCustomLinkGeneration}
                className="bg-gold text-navy-blue px-4 py-2 rounded"
              >
                Generate
              </button>
            </div>
          )}
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Link Clicks</h3>
            <div className="flex items-center">
              <ExternalLink size={24} className="text-blue-500 mr-2" />
              <span className="text-3xl font-bold">{metrics.clicks}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Sign-ups</h3>
            <div className="flex items-center">
              <Users size={24} className="text-green-500 mr-2" />
              <span className="text-3xl font-bold">{metrics.signUps}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Total Earnings</h3>
            <div className="flex items-center">
              <DollarSign size={24} className="text-gold mr-2" />
              <span className="text-3xl font-bold">${metrics.totalEarnings}</span>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Weekly Referral Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={referralData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="referrals" fill="#0f2a4a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Conversion Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#0f2a4a" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Recent Referral Activity</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-2">User</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReferrals.map((referral) => (
                <tr key={referral.id}>
                  <td className="py-2">{referral.user}</td>
                  <td className="py-2">{referral.date}</td>
                  <td className="py-2">{referral.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Promotion Guide */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Promotion Guide</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Share your affiliate link on social media platforms</li>
            <li>Create content showcasing GYB AI's features and benefits</li>
            <li>Engage with your audience and answer questions about GYB AI</li>
            <li>Offer exclusive discounts or bonuses to your referrals</li>
            <li>Collaborate with other influencers or content creators</li>
          </ul>
        </div>

        {/* Payout History and Balance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Payout History and Balance</h3>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg">Current Balance:</span>
            <span className="text-2xl font-bold">${metrics.totalEarnings}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.map((payout) => (
                <tr key={payout.id}>
                  <td className="py-2">{payout.date}</td>
                  <td className="py-2">${payout.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Affiliate Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Affiliate Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Payout Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300"
              >
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Payout Threshold</label>
              <select
                value={payoutThreshold}
                onChange={(e) => setPayoutThreshold(Number(e.target.value))}
                className="w-full px-4 py-2 rounded border border-gray-300"
              >
                <option value="50">$50</option>
                <option value="100">$100</option>
                <option value="250">$250</option>
                <option value="500">$500</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invites;