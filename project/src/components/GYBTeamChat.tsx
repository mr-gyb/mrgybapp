import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, Paperclip, Mic, Send, Camera, Image as ImageIcon, Video, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// For Firebase logic
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isAI?: boolean;
}

interface TeamChat {
  id: string;
  name: string;
  participants: string[];
  messages: ChatMessage[];
}

const GYBTeamChat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [teamChats, setTeamChats] = useState<TeamChat[]>([]);
  const { user } = useAuth();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatParticipants, setNewChatParticipants] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

    // Getting the existing chat
    useEffect(() => {
      if (!user) return;
    
      // quering the dream_team_chat collection team members
      // so that q have a information of participants
      const q = query(
        collection(db, 'dream_team_chat'),
        where('teamMembers', 'array-contains', user.uid)
      );
    
      // based on the q that queried from the above function
      // doc.data() => the field that inside the corresponding id
      // ...doc.data() list the data of the docs
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<TeamChat, 'id' >),
          messages: [],
        }));
    
        setTeamChats(rooms); // 전체 채팅방 목록 업데이트

      });
    
      return () => unsubscribe();
    }, [user]);


  // Getting the existing message based on the chat 
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if(!selectedChat) return;

    // Construct a message query for the chat
    const q = query(
      collection(db, `dream_team_chat/${selectedChat}/messages`),
      orderBy('timestamp', 'asc')
    );

    // Register the snapshot for that chat
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages: ChatMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<ChatMessage, 'id'>)
      })) 

      // Adding the firebase messages into the empty message[] 
    setTeamChats(prevChats => 
      prevChats.map(chat => 
        chat.id === selectedChat
          ? { ...chat, messages: loadedMessages }
          : chat
      )
    );
    setMessage('');  
  });
  
  return () => unsubscribe();

  }, [selectedChat, user]);

  const handleSendMessage = () => {
    /*
    if (message.trim() && selectedChat) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setTeamChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat
            ? { ...chat, messages: [...chat.messages, newMessage] }
            : chat
        )
      );
      setMessage('');
    }
      */

    if (message.trim() && selectedChat){
      try{
        addDoc(
          collection(db, `dream_team_chat/${selectedChat}/messages`),
          {
            content: message,
            senderId:  user?.uid,
            senderType:'user',
            timestamp: new Date().toISOString(),
          }
        );
        setMessage('');
      } catch(error){
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // needs to be fixed !!
  const createNewChat = () => {
    if (newChatName && newChatParticipants) {
      const newChat: TeamChat = {
        id: Date.now().toString(),
        name: newChatName,
        participants: newChatParticipants.split(',').map(p => p.trim()),
        messages: []
      };
      setTeamChats(prevChats => [...prevChats, newChat]);
      setNewChatName('');
      setNewChatParticipants('');
      setShowNewChatModal(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue flex flex-col">
      <div className="bg-navy-blue text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/new-chat" className="mr-4 text-white">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">GYB Team Chat</h1>
        </div>
        <button
          onClick={() => setShowNewChatModal(true)}
          className="bg-gold text-navy-blue px-3 py-1 rounded-full flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" />
          New Chat
        </button>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 text-navy-blue"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          {teamChats.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 hover:bg-gray-100 cursor-pointer ${selectedChat === chat.id ? 'bg-gray-100' : ''}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <h3 className="font-semibold">{chat.name}</h3>
              {/*<p className="text-sm text-gray-600 truncate">
                {chat.participants?.join(', ') || 'No participants'}
              </p>
              */}
            </div>
          ))}
        </div>

        {/* Right chat area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {teamChats.find((chat) => chat.id === selectedChat)?.name}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {teamChats.find((chat) => chat.id === selectedChat)?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        msg.isAI ? 'bg-gold text-navy-blue' : 'bg-navy-blue text-white'
                      }`}
                    >
                      <p className="font-semibold mb-1">{msg.sender}</p>
                      <p>{msg.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center bg-gray-100 rounded-full">
                  <button className="p-2 text-gray-500 hover:text-navy-blue">
                    <Paperclip size={20} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-navy-blue">
                    <Camera size={20} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-navy-blue">
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-navy-blue">
                    <Video size={20} />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-navy-blue"
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Chat</h2>
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Chat Name"
              className="w-full mb-4 p-2 border rounded"
            />
            <input
              type="text"
              value={newChatParticipants}
              onChange={(e) => setNewChatParticipants(e.target.value)}
              placeholder="Participants (comma-separated)"
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNewChat}
                className="px-4 py-2 bg-navy-blue text-white rounded hover:bg-opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GYBTeamChat;