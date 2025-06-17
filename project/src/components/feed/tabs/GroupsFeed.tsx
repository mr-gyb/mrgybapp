import React from 'react';
import { Users, MessageCircle, Calendar, ArrowRight, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const GroupsFeed: React.FC = () => {
  const navigate = useNavigate();
  const groups = [
    {
      id: '1',
      name: 'Digital Marketing Pros',
      members: 1234,
      posts: 567,
      description: 'A community of digital marketing professionals sharing insights and strategies',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Tech Entrepreneurs',
      members: 2345,
      posts: 890,
      description: 'Connect with fellow tech entrepreneurs and share your startup journey',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      lastActive: '5 minutes ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Create Group Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/group/create')}
          className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <Link
            key={group.id}
            to={`/group/${group.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${group.image})` }} />
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{group.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{group.members.toLocaleString()} members</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle size={16} className="mr-1" />
                  <span>{group.posts.toLocaleString()} posts</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  <span>Active {group.lastActive}</span>
                </div>
                <div className="flex items-center text-navy-blue">
                  View Group
                  <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GroupsFeed;