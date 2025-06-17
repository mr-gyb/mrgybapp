import React, { useState } from 'react';
import {
  Filter,
  X,
  Bot,
  Users,
  History,
  MessagesSquare,
  MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomeFilterProps {
  onFilterChange: (filters: { agentType: string[] }) => void;
}

const HomeFilter: React.FC<HomeFilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const navigate = useNavigate();

  const aiTeamMembers = [
    { id: 'mrgyb', name: 'Mr.GYB AI', icon: Bot },
    { id: 'ceo', name: 'CEO', icon: Users },
    { id: 'coo', name: 'COO', icon: Users },
    { id: 'chro', name: 'CHRO', icon: Users },
    { id: 'cto', name: 'CTO', icon: Users },
    { id: 'cmo', name: 'CMO', icon: Users },
  ];

  const handleAgentToggle = (agentName: string) => {
    const newAgents = selectedAgents.includes(agentName)
      ? selectedAgents.filter((name) => name !== agentName)
      : [...selectedAgents, agentName];

    setSelectedAgents(newAgents);
    onFilterChange({ agentType: newAgents });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-32 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-navy-blue text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
      >
        <Filter size={24} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-6 w-80">
          {/* <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">AI Team Members</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {aiTeamMembers.map((member) => (
              <label
                key={member.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(member.name)}
                  onChange={() => handleAgentToggle(member.name)}
                  className="form-checkbox h-4 w-4 text-navy-blue rounded border-gray-300 focus:ring-navy-blue"
                />
                <member.icon size={20} className="ml-2 mr-2 text-navy-blue" />
                <span className="ml-2">{member.name}</span>
              </label>
            ))}
          </div> */}

          <div className="space-y-2">
            <button
              onClick={() => handleNavigate('/dream-team')}
              className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded"
            >
              <Users size={20} className="mr-2 text-navy-blue" />
              Dream Team
            </button>
            <button
              onClick={() => handleNavigate('/gyb-team-chat')}
              className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded"
            >
              <MessagesSquare size={20} className="mr-2 text-navy-blue" />
              GYB Team Chat
            </button>
            <button
              onClick={() => handleNavigate('/new-chat')}
              className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded"
            >
              <MessageCircle size={20} className="mr-2 text-navy-blue" />
              Start New Chat
            </button>
            <button
              onClick={() => handleNavigate('/chat-history')}
              className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded"
            >
              <History size={20} className="mr-2 text-navy-blue" />
              Chat History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeFilter;
