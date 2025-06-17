import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics: React.FC = () => {
  const data = [
    { name: 'Blog Posts', views: 4000, engagement: 2400 },
    { name: 'Videos', views: 3000, engagement: 1398 },
    { name: 'Images', views: 2000, engagement: 9800 },
    { name: 'Audio', views: 2780, engagement: 3908 },
    { name: 'Social Posts', views: 1890, engagement: 4800 },
  ];

  const metrics = [
    { name: 'Followers Growth', value: '+15%' },
    { name: 'Clickthrough Rate', value: '3.2%' },
    { name: 'CPC (Cost Per Click)', value: '$0.45' },
    { name: 'CPM (Cost Per Mille)', value: '$5.20' },
    { name: 'AOV (Average Order Value)', value: '$75' },
    { name: 'LTV (Lifetime Value)', value: '$250' },
  ];

  const platformData = [
    { name: 'Instagram', value: 45 },
    { name: 'YouTube', value: 30 },
    { name: 'Blog', value: 15 },
    { name: 'Twitter', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/gyb-studio" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Analytics</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Content Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#0f2a4a" name="Total Views" />
              <Bar dataKey="engagement" fill="#d4af37" name="Engagement" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Top Performing Platform</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
            <ul className="space-y-2">
              {metrics.map((metric, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{metric.name}</span>
                  <span className="font-semibold text-navy-blue">{metric.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Top Converting Content</h3>
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <span>Email Marketing Campaign</span>
              <span className="text-green-500 font-semibold">25% conversion</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Product Demo Video</span>
              <span className="text-green-500 font-semibold">18% conversion</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Customer Success Story</span>
              <span className="text-green-500 font-semibold">15% conversion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;