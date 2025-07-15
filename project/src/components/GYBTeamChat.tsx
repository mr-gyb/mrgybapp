import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, Paperclip, Mic, Send, Camera, Image as ImageIcon, Video, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// For Firebase logic
import { arrayRemove, collection, addDoc, arrayUnion, serverTimestamp, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  isAI?: boolean;
}

interface TeamChat {
  id: string;
  name: string;
  participants: string[];
  messages: ChatMessage[];
  teamMembers : string[];
}

interface ChatInvitation {
  id: string;
  chatId: string;
  invitedUid: string;
  invitedEmail: string;
  invitedBy: string;
  createdAt: any; // Firebase Timestamp (or Timestamp if imported)
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
  //for invitations
  const [invitations, setInvitations] = useState<ChatInvitation[]>([]);
  const navigate = useNavigate();
  const [chatParticipants, setChatParticipants] = useState<{ [chatId: string]: string[] }>({});
  // For storing the previous messages.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Getting the existing message based on the chat 
  // For right side of the dream_team ( Messages lists )
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
      // Should get a name from profile field 
      // So use asnyc function.
      // For get the sender name from the Profile field and 
      // stores it into the sender(string) inthe ChatMessage[] interface.
      const fetchMessagesWithSender = async () => {
        const loadedMessages: ChatMessage[] = await Promise.all(
          snapshot.docs.map(async (mdoc) => {
            const data = mdoc.data() as Omit<ChatMessage, 'id' | 'sender'>;
            let senderName = 'Unknown';
  
            if (data.senderId === 'ai') {
              senderName = 'GYB AI';
            } else if (data.senderId) {
              const profileSnap = await getDoc(doc(db, 'profiles', data.senderId));
              if (profileSnap.exists()) {
                senderName = profileSnap.data().name || 'No Name';
              }
            }
  
            return {
              id: mdoc.id,
              sender: senderName,
              ...data,
            };
          })
        );
        setChatMessages(loadedMessages);
        setMessage('');
      };
  
      // execute fetchMessagewith Sender()
      fetchMessagesWithSender();
    });
  
    return () => unsubscribe();
  }, [selectedChat]);

  // Getting the existing chat
  // For left side of the dream_team ( Chat room lists )
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
          ...(doc.data() as Omit<TeamChat, 'id' | 'messages'  >),
          messages: teamChats.find(c => c.id === doc.id)?.messages || [],
        }));
    
        setTeamChats(rooms); // update the all the rooms in the list
      });
    
      return () => unsubscribe();
  }, [user ,selectedChat]);


  // if User got invitation by some user
  // For Sending invitation create a chat invitation field in firebase database
  useEffect(() => {
    if(!user?.uid) return;

    const q = query(
      collection(db, 'chat_invitations'),
      where('invitedUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<ChatInvitation, 'id'>)
      }));
      setInvitations(invites); // for UI state
    });


  })

  //  Fetch Participants of the chat room and stores the participants to ChatParticipants state.
  // Show participants below the chatroom title.
  useEffect(() => {
    const fetchParticipants = async () => {
      const participantsMap: { [chatId: string]: string[] } = {};
      // console.log("ParticipantsMap", participantsMap);

      for (const chat of teamChats) {
        // By doing promise.all, ensure that all the data is accessed and stores to the names type
        const names: string[] = await Promise.all(
          // getting all the uid in the selected chat
          (chat.teamMembers || []).map(async (uid) => {
            // Getting the user in the profile field by selected uid.
            const profileRef = doc(db, 'profiles', uid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              // returning the name in the profile field.
              return profileSnap.data().name || 'NO NAME';
            }
            return 'NO NAME';
          })
        );
        participantsMap[chat.id] = names;
      }

      setChatParticipants(participantsMap);
    };

    if (teamChats.length > 0) {
      fetchParticipants();
    }
  }, [teamChats]);

  // Handling message send, stores to the firebase in the dream_team chat field
  // Goes to subdomain "Message " field 
  const handleSendMessage = async () => {
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
        // trim a message to get the email
        const trimmed = message.trim();

        // if user input starts with invitation
        if(trimmed.startsWith('/invite')){
          const parts = trimmed.split(' ');
          if (parts.length < 2){
            alert("Provide valid email");
            return;
          }
          const email = parts[1];
          await inviteUserByEmail(email, selectedChat);
          setMessage('')
          return;
        }

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

  // inviting user through valid email
  // Getting the user information via email in profile field and 
  // create chat_invitation field also add the inviting user to the teamMembers field.
  const inviteUserByEmail = async(email: string, chatId: string) => {
    const q = query(collection(db, 'profiles'), where('email', '==', email));
    const snapshot = await getDocs(q)
    console.log('inviting!!!');

    if (snapshot.empty){
      alert('NOT OUR USER');
      return;
    }

    const invitedUserDoc = snapshot.docs[0];
    const invitedUid = invitedUserDoc.id;

    await addDoc(collection(db, 'chat_invitations'), {
      chatId,
      invitedUid,
      invitedEmail: email,
      invitedBy: user?.uid,
      createdAt: serverTimestamp()
    });

    // Add to the participants
    const chatRef = doc(db, 'dream_team_chat', chatId);
    await updateDoc(chatRef, {
      teamMembers: arrayUnion(invitedUid)
    });


    setMessage('');
    //alert('user invited')
  }


  // Handling when user accept the invitation
  // Delete the chat_invitation data in the chat_invitations field.
  const handleAccept = async (invite:any) => {
  
    // 2. delete invitation 
    await deleteDoc(doc(db, 'chat_invitations', invite.id));
  };
  
  // Handling decline the invitation
  // delete the chat_invitaion and should delete this person from the teamMembers.
  const handleDecline = async (invite: any) => {
    // find the inviteId
    const invites = invitations.find(inv => inv.id === invite.id);
    await deleteDoc(doc(db, 'chat_invitations', invite.id));
    // If the inviteId is same as declined room then remove it
    if (invite && selectedChat === invite.chatId) {
      setSelectedChat(null);
    }

    const chatRef = doc(db, 'dream_team_chat', invite.chatId);
    await updateDoc(chatRef, {
      teamMembers: arrayRemove(invite.invitedUid)
    });

  };

  // if user press the send button
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Creating a new chat with new member
  const createNewChat = async () => {
    // if user have a newChatName in the input
    if (newChatName) {

      const chatRef = await addDoc(collection(db, 'dream_team_chat'), {
        name: newChatName,
        teamMembers: [user?.uid], // 또는 []
      });

      // get the email from the user input
      const emails = newChatParticipants
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

      // invitation
      for (const email of emails){
        await inviteUserByEmail(email, chatRef.id);
      }

      // The newChat is added by the snapshot on the top useEffect function 
      // so we don't need to manually add the new chat
      // setTeamChats(prevchats => [...prevchats, newChat]);

      // reset input
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
          {teamChats.map((chat) => {
            if (!user) {return null;}

            const invite = invitations.find(inv => inv.chatId === chat.id);
            
            const q = query(
              collection(db, 'dream_team_chat'),
              where('teamMembers', 'array-contains', user.uid)
            );
          
            if (!q && !invite) {return null};

            return (
              <div
                key={chat.id}
                className={`p-4 hover:bg-gray-100 cursor-pointer ${selectedChat === chat.id ? 'bg-gray-100' : ''}`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <h3 className="font-semibold">{chat.name}</h3>
                {/* button for accept/decline */}
                {invite && (
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded"
                      onClick={e => { e.stopPropagation(); handleAccept(invite); }}
                    >
                      accept
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={e => { e.stopPropagation(); handleDecline(invite); }}
                    >
                      decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right chat area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {teamChats.find((chat) => chat.id === selectedChat)?.name}
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                  Participants : {chatParticipants[selectedChat]?.join(', ') || ''}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}
                  >
                  <p className="text-sm mb-1">{msg.sender}</p>
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        msg.senderId === user?.uid || msg.isAI
                        ? 'bg-gold text-navy-blue' 
                        : 'bg-navy-blue text-white'
                      }`}
                    >
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
              placeholder="Enter the email of team members (comma-separated)"
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
                onClick = {createNewChat}
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