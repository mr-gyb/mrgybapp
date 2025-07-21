import React, { useState, useEffect } from 'react';
import { ChevronLeft, MessageSquare, Send, Mic, Camera, Paperclip, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

interface TeamMember {
  id: string;
  title: string;
  image: string;
  specializations: string[];
}

const DreamTeam: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const { createNewChat, addMessage, currentChatId } = useChat();

  const teamMembers: TeamMember[] = [
    {
      id: 'mrgyb',
      title: 'Mr.GYB AI',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58',
      specializations: [
        'ALL-IN-ONE BUSINESS GROWTH ASSISTANT',
        'DIGITAL MARKETING',
        'MEDIA MANAGEMENT',
        'BIZ OPERATIONS AND DEVELOPMENT',
        'SYSTEMS FOR SCALING THROUGH AUTOMATIONS AND AI'
      ]
    },
    {
      id: 'ceo',
      title: 'CEO',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCEO.png?alt=media&token=62f3fe9f-0b51-4501-becd-c9bf88d7bf0e',
      specializations: [
        'STRATEGIC PLANNING',
        'BUSINESS DEVELOPMENT',
        'LEADERSHIP',
        'DECISION MAKING',
        'CORPORATE GOVERNANCE'
      ]
    },
    {
      id: 'coo',
      title: 'COO',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCOO.png?alt=media&token=d57a97eb-83f5-4e0d-903e-278dc2a4d9af',
      specializations: [
        'OPERATIONS MANAGEMENT',
        'PROCESS OPTIMIZATION',
        'SUPPLY CHAIN MANAGEMENT',
        'QUALITY CONTROL',
        'RESOURCE ALLOCATION'
      ]
    },
    {
      id: 'chro',
      title: 'CHRO',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCHRO.png?alt=media&token=862bbf8c-373b-4996-89fe-8d867f378d9f',
      specializations: [
        'HUMAN RESOURCES MANAGEMENT',
        'TALENT ACQUISITION',
        'EMPLOYEE DEVELOPMENT',
        'ORGANIZATIONAL CULTURE',
        'PERFORMANCE MANAGEMENT'
      ]
    },
    {
      id: 'cto',
      title: 'CTO',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCTO.png?alt=media&token=e856c7b0-440d-4776-ba3b-8eb0bb89165d',
      specializations: [
        'TECHNOLOGY STRATEGY',
        'INNOVATION MANAGEMENT',
        'SYSTEM ARCHITECTURE',
        'CYBERSECURITY',
        'DIGITAL TRANSFORMATION'
      ]
    },
    {
      id: 'cmo',
      title: 'CMO',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FCMO.png?alt=media&token=4e9ddaee-c4b0-4b4d-aca8-6c4196a5dd1b',
      specializations: [
        'MARKETING STRATEGY',
        'BRAND MANAGEMENT',
        'CUSTOMER EXPERIENCE',
        'MARKET RESEARCH',
        'DIGITAL MARKETING'
      ]
    }
  ];

  const handleMemberClick = (memberId: string) => {
    setSelectedMember(memberId === selectedMember ? null : memberId);
  };

  const handleStartChat = (memberTitle: string) => {
    navigate(`/chat/chatId`, { state: { selectedAgent: memberTitle, chatId: newChatId } });
  };

  const handleSendMessage = () => {
    if (input.trim() && currentChatId && selectedMember) {
      const memberTitle = teamMembers.find(m => m.id === selectedMember)?.title || '';
      addMessage(currentChatId, 'user', input);
      setInput('');
      setTimeout(() => {
        addMessage(currentChatId, 'assistant', `Response from ${memberTitle}: "${input}"`);
      }, 1000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to={`/chat/${currentChatId}`} className="mr-4 text-navy-blue">
            <ChevronLeft size={24} /> 
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">GYB AI Team Members</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className={`relative cursor-pointer rounded-lg overflow-hidden shadow-md transition-transform duration-300 transform hover:scale-105 ${
                selectedMember === member.id ? 'ring-4 ring-gold' : ''
              }`}
              onClick={() => handleMemberClick(member.id)}
            >
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={member.image}
                  alt={member.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-navy-blue bg-opacity-75 p-2">
                <h3 className="text-xl font-bold text-center text-white">{member.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {selectedMember && (
          <div className="bg-gray-100 rounded-lg p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {teamMembers.find((m) => m.id === selectedMember)?.title}
              </h2>
              <button
                onClick={() => handleStartChat(teamMembers.find((m) => m.id === selectedMember)?.title || '')}
                className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
              >
                <MessageSquare size={20} className="mr-2" />
                Start Chat
              </button>
            </div>
            <ul className="list-disc list-inside mb-4">
              {teamMembers
                .find((m) => m.id === selectedMember)
                ?.specializations.map((spec, index) => (
                  <li key={index} className="mb-2">
                    {spec}
                  </li>
                ))}
            </ul>
            <div className="flex items-center bg-white rounded-full p-2">
              <button className="p-2 text-gray-500 hover:text-navy-blue">
                <Paperclip size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:text-navy-blue">
                <Camera size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:text-navy-blue">
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-grow bg-transparent border-none focus:outline-none px-4 py-2 text-navy-blue"
              />
              <button className="p-2 text-gray-500 hover:text-navy-blue">
                <Mic size={20} />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 text-blue-500 hover:text-blue-600"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamTeam;