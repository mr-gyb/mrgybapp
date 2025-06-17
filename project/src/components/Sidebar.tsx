import React from 'react';
import { Upload, FileType, Video, Image, Headphones, FileText, Share2, Settings, BarChart } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'edit', icon: FileType, label: 'Edit' },
    { id: 'video', icon: Video, label: 'Videos' },
    { id: 'image', icon: Image, label: 'Images' },
    { id: 'audio', icon: Headphones, label: 'Audio' },
    { id: 'blog', icon: FileText, label: 'Blog Posts' },
    { id: 'social', icon: Share2, label: 'Social Media' },
    { id: 'analytics', icon: BarChart, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="bg-white w-64 p-6 shadow-lg">
      <nav>
        <ul className="space-y-4">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={`flex items-center space-x-2 w-full p-2 rounded ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;