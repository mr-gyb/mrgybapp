import React from 'react';
import { ChevronLeft, Plus, BarChart2, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GYBStudio: React.FC = () => {
  const navigate = useNavigate();

  const contentData = [
    { name: 'Blog Posts', views: 4000, engagement: 2400 },
    { name: 'Videos', views: 3000, engagement: 1398 },
    { name: 'Images', views: 2000, engagement: 9800 },
    { name: 'Audio', views: 2780, engagement: 3908 },
    { name: 'Social Posts', views: 1890, engagement: 4800 },
  ];

  const platformData = [
    { name: 'Instagram', value: 45 },
    { name: 'YouTube', value: 30 },
    { name: 'Blog', value: 15 },
    { name: 'Twitter', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const metrics = [
    { name: 'Followers Growth', value: '+15%' },
    { name: 'Clickthrough Rate', value: '3.2%' },
    { name: 'CPC (Cost Per Click)', value: '$0.45' },
    { name: 'CPM (Cost Per Mille)', value: '$5.20' },
    { name: 'AOV (Average Order Value)', value: '$75' },
    { name: 'LTV (Lifetime Value)', value: '$250' },
  ];

  const trendingPosts = [
    {
      id: 1,
      title: "BREAKING: The Menendez brothers are one step closer to freedom after L...",
      views: "72.3M",
      likes: "5.9M",
      image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      title: "Wait 😂",
      views: "36.1M",
      likes: "6.3M",
      image: "https://images.unsplash.com/photo-1586374579358-9d19d632b6df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      title: "Former President Barack Obama raps Eminem's \"Lose Yourself,\" after bei...",
      views: "40.1M",
      likes: "2.9M",
      image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ];

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4 text-navy-blue">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-navy-blue">GYB Studio</h1>
          </div>
          <button
            onClick={() => navigate('/new-post')}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Create Content
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Content Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Content Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentData}>
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

          {/* Platform Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Platform Distribution</h3>
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
        </div>

        {/* Monetization Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Monetization</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600 mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Creation Inspirations */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Creation Inspirations</h2>
          <div className="space-y-4">
            {trendingPosts.map((post, index) => (
              <div key={post.id} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-300">{index + 1}</div>
                <div className="relative flex-shrink-0 w-24 h-32">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingUp size={16} className="mr-1" />
                    <span className="mr-4">{post.views}</span>
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Content History</h2>
          <p className="text-gray-600">Your recent content will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default GYBStudio;