import React from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { Archive } from 'lucide-react';

const ArchivedChats: React.FC = () => {
  return (
    <SettingsPageTemplate title="Archived Chats">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-6">
          <Archive size={24} className="text-navy-blue mr-3" />
          <h2 className="text-xl font-bold">Archived Conversations</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Your archived chats will appear here. Archived chats are hidden from your main chat list but can be restored at any time.
        </p>
        <div className="text-center py-8 text-gray-500">
          <Archive size={48} className="mx-auto mb-4 opacity-50" />
          <p>No archived chats yet</p>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default ArchivedChats;