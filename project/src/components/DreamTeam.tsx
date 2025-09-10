import React, { useState, useEffect, useRef } from 'react';
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
  const { createNewChat, addMessage, currentChatId, chats, setSelectedAgent } = useChat();
  // For scrolling to bottom of the screen
  const screenEndRef = useRef<HTMLDivElement>(null);

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
      id: 'chris',
      title: 'CHRIS',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FChris-ai.png?alt=media&token=83b2003d-04bf-422e-a0f7-26d148a4ff46',
      specializations: [
        'STRATEGIC PLANNING',
        'BUSINESS DEVELOPMENT',
        'LEADERSHIP',
        'DECISION MAKING',
        'CORPORATE GOVERNANCE'
      ]
    },
    {
      id: 'sherry',
      title: 'Sherry',
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
      id: 'charlotte',
      title: 'Charlotte',
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
      id: 'jake',
      title: 'Jake',
      image: 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FJake-ai.png?alt=media&token=cf28a12b-f86a-4aed-b5af-32f5de16cfe9',
      specializations: [
        'TECHNOLOGY STRATEGY',
        'INNOVATION MANAGEMENT',
        'SYSTEM ARCHITECTURE',
        'CYBERSECURITY',
        'DIGITAL TRANSFORMATION'
      ]
    },
    {
      id: 'rachel',
      title: 'Rachel',
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
    screenEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartChat = async (newAgent: string) => {
    try {
      // Check if there is an existing chat
      // Chats have several chat room objects.
      // .find() => return the first room that satisfy the requirement.
      // If there are a message that have role == assistant and aiAgent == selectedAgent
      // Then return true otherwise return false to indicate whether there are existing chat.
      const existingChat = chats.find((chat) => {
        return (
          chat.messages &&
          chat.messages.some(
            (message) =>
              message.role === "assistant" && message.aiAgent === newAgent
          )
        );
      });

      if (existingChat) {
        navigate(`/chat/${existingChat.id}`);
      } else {
        const newChatId = await createNewChat();

        if (newChatId) {
          // Add initial message from the new agent
          const initialMessage = `Hello! I'm ${newAgent}. How can I help you today?`;
          await addMessage(
            newChatId,
            initialMessage,
            "assistant",
            undefined,
            newAgent
          );
          navigate(`/chat/${newChatId}`);
          setSelectedAgent(newAgent);
        }
      }
    } catch (error) {
      console.error("Error Handling going to the agent chat", error);
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
          </div>
        )}
      </div>
      <div ref={screenEndRef} />
    </div>
  );
};

export default DreamTeam;