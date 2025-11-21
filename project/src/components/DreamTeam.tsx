import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, Bot, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { getInitials } from '../utils/avatar';

interface TeamMember {
  id: string;
  title: string;
  role: string;
  roleDescription: string;
  image: string;
  specializations: string[];
  isAI?: boolean;
}

const DreamTeam: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { createNewChat, addMessage, currentChatId, chats, setSelectedAgent } = useChat();

  const handleImageError = (memberId: string) => {
    setImageErrors((prev) => new Set(prev).add(memberId));
  };

  const toggleFlip = (memberId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
      } else {
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const teamMembers: TeamMember[] = [
    // Top row: Chris, Charlotte, Alex
    {
      id: 'chris',
      title: 'Chris',
      role: 'CEO',
      roleDescription: 'Executive Leadership',
      image: '/images/team/chris.jpg',
      specializations: [
        'STRATEGIC PLANNING',
        'BUSINESS DEVELOPMENT',
        'LEADERSHIP',
        'DECISION MAKING',
        'CORPORATE GOVERNANCE'
      ],
      isAI: false
    },
    {
      id: 'charlotte',
      title: 'Charlotte',
      role: 'CHRO',
      roleDescription: 'Human Resources',
      image: '/images/team/charlotte.jpg',
      specializations: [
        'HUMAN RESOURCES MANAGEMENT',
        'TALENT ACQUISITION',
        'EMPLOYEE DEVELOPMENT',
        'ORGANIZATIONAL CULTURE',
        'PERFORMANCE MANAGEMENT'
      ],
      isAI: false
    },
    {
      id: 'alex',
      title: 'Alex',
      role: 'Operations Expert',
      roleDescription: 'Operations & Strategy',
      image: '/images/team/alex.jpg',
      specializations: [
        'BUSINESS STRATEGY',
        'OPERATIONS',
        'CLIENT RELATIONS',
        'PROJECT MANAGEMENT',
        'GROWTH INITIATIVES'
      ],
      isAI: false
    },
    // Second row: Devin, Jake, MR.GYB AI
    {
      id: 'devin',
      title: 'Devin',
      role: 'Team Member',
      roleDescription: 'Technology & Development',
      image: '/images/team/devin.jpg',
      specializations: [
        'TECHNOLOGY DEVELOPMENT',
        'SYSTEM ARCHITECTURE',
        'INNOVATION',
        'SOFTWARE ENGINEERING',
        'TECHNICAL STRATEGY'
      ],
      isAI: false
    },
    {
      id: 'jake',
      title: 'Jake',
      role: 'Tech Expert',
      roleDescription: 'Technology',
      image: '/images/team/jake.png',
      specializations: [
        'TECHNOLOGY STRATEGY',
        'INNOVATION MANAGEMENT',
        'SYSTEM ARCHITECTURE',
        'CYBERSECURITY',
        'DIGITAL TRANSFORMATION'
      ],
      isAI: false
    },
    {
      id: 'mrgyb',
      title: 'MR.GYB AI',
      role: 'Business Growth Expert',
      roleDescription: 'Business Growth',
      image: '/images/team/mrgyb-ai.png',
      specializations: [
        'ALL-IN-ONE BUSINESS GROWTH ASSISTANT',
        'DIGITAL MARKETING',
        'MEDIA MANAGEMENT',
        'BIZ OPERATIONS AND DEVELOPMENT',
        'SYSTEMS FOR SCALING THROUGH AUTOMATIONS AND AI'
      ],
      isAI: true
    }
  ];

  // Get back color based on index (alternating blue and gold)
  const getBackColor = (index: number) => {
    return index % 2 === 0 ? 'bg-navy-blue' : 'bg-gold';
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
        // Set selectedAgent before navigating to ensure it persists
        setSelectedAgent(newAgent);
        navigate(`/chat/${existingChat.id}`);
      } else {
        const newChatId = await createNewChat();

        if (newChatId) {
          // Set selectedAgent before navigating
          setSelectedAgent(newAgent);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teamMembers.map((member, index) => {
            const hasImageError = imageErrors.has(member.id);
            const initials = getInitials(member.title);
            const altText = `${member.title} - ${member.role}`;
            const isFlipped = flippedCards.has(member.id);
            const backColor = getBackColor(index);

            return (
              <div
                key={member.id}
                className="flip-card-container"
                style={{
                  perspective: '1000px',
                  width: '100%',
                  height: '400px',
                }}
                onClick={() => toggleFlip(member.id)}
                onMouseEnter={() => {
                  if (!isFlipped) toggleFlip(member.id);
                }}
                onMouseLeave={() => {
                  if (isFlipped) toggleFlip(member.id);
                }}
              >
                <div
                  className="flip-card-inner relative w-full h-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front of card */}
                  <div
                    className="flip-card-front absolute w-full h-full bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Cover image section */}
                    <div className="h-32 bg-gradient-to-br from-navy-blue to-blue-600 bg-cover bg-center relative">
                      {!hasImageError && (
                        <img
                          src={member.image}
                          alt={altText}
                          className="w-full h-32 object-cover opacity-30"
                          loading="lazy"
                          decoding="async"
                          onError={() => handleImageError(member.id)}
                        />
                      )}
                    </div>
                    
                    {/* Content section with overlapping avatar */}
                    <div className="p-4 relative">
                      {/* Profile avatar - overlapping the cover */}
                      <div className="absolute -top-12 left-4">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                          {hasImageError ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-blue to-blue-600">
                              <span className="text-white text-2xl font-bold">{initials}</span>
                            </div>
                          ) : (
                            <img
                              src={member.image}
                              alt={altText}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              onError={() => handleImageError(member.id)}
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="mt-14">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <h3 className="font-bold text-xl">{member.title}</h3>
                          </div>
                          {member.isAI ? (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                              <Bot size={16} className="mr-1" />
                              AI
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                              <Briefcase size={16} className="mr-1" />
                              {member.role}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <Briefcase size={16} className="text-gray-500 mr-2" />
                          <span className="text-gray-600">{member.roleDescription}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back of card */}
                  <div
                    className={`flip-card-back absolute w-full h-full ${backColor} rounded-lg shadow-md overflow-hidden cursor-pointer text-white p-6 flex flex-col justify-between`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div>
                      <h3 className="text-2xl font-bold mb-4">{member.title}</h3>
                      <p className="text-lg mb-4 opacity-90">{member.role} • {member.roleDescription}</p>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2 opacity-80">SPECIALIZATIONS:</h4>
                        <ul className="space-y-2">
                          {member.specializations.map((spec, specIndex) => (
                            <li key={specIndex} className="text-sm opacity-90">
                              • {spec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartChat(member.title);
                      }}
                      className="w-full bg-white text-navy-blue px-6 py-3 rounded-full font-semibold flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                    >
                      <MessageSquare size={20} className="mr-2" />
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DreamTeam;