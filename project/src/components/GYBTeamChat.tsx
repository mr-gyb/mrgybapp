import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, Paperclip, Mic, Send, Camera, Image as ImageIcon, Video, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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
  const [teamChats, setTeamChats] = useState<TeamChat[]>([
    {
      id: '1',
      name: 'Marketing Campaign',
      participants: ['@john', '@sarah', 'Mr.GYB AI'],
      messages: [
        { id: '1', sender: '@john', content: "Hey team, what's our plan for the new campaign?", timestamp: new Date().toISOString() },
        { id: '2', sender: 'Mr.GYB AI', content: 'Based on our recent market analysis, I suggest focusing on social media engagement.', timestamp: new Date().toISOString(), isAI: true },
      ]
    },
    // Add more sample chats here
  ]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatParticipants, setNewChatParticipants] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [chatParticipants, setChatParticipants] = useState<{
    [chatId: string]: string[];
  }>({});
  // For storing participants profile image
  const [profileImage, setProfileImage] = useState<{ [uid: string]: string }>(
    {}
  );
  // For storing the previous messages.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // For showing the instruction (how to use)
  const [showInsturction, setshowInstruction] = useState(false);
  // Getting the currentChatId
  const { currentChatId } = useChat();
  // for the processing message
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAiAgnet, setIsProcessingAiAgent] = useState("");
  // For test
  const [message123, setMessage123] = useState("");

  // Getting the existing message based on the chat
  // For right side of the dream_team ( Messages lists )
  useEffect(() => {


    if (!selectedChat) return;
    if (!user || !user.uid) return;

    // Construct a message query for the chat
    const q = query(
      collection(db, `dream_team_chat/${selectedChat}/messages`),
      orderBy("timestamp", "asc")
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
            const data = mdoc.data() as Omit<ChatMessage, "id" | "sender">;
            let senderName = "Unknown";
            let profileImage =
              "https://cdn-icons-png.flaticon.com/512/63/63699.png";

            if (data.senderId === "ai") {
              senderName = data.aiAgent?.toUpperCase() || "KEVIN";
              // To retrieve the AI agent profile image set the proper name
              let agentKey = data.aiAgent?.toLowerCase() || "mr.gyb ai";
              if (agentKey === "mr.gyb ai") {
                agentKey = "mr-gyb-ai";
              }
              profileImage =
                AI_USERS[agentKey]?.profile_image_url ||
                "https://cdn-icons-png.flaticon.com/512/63/63699.png";
            } else if (data.senderId) {
              const profileSnap = await getDoc(
                doc(db, "profiles", data.senderId)
              );
              
              if (profileSnap.exists()) {
                senderName = profileSnap.data().name || "No Name";
                profileImage =
                  profileSnap.data().profile_image_url || profileImage;
              }
            }

            return {
              id: mdoc.id,
              sender: senderName,
              profileImage,
              ...data,
            };
          })
        );
        setChatMessages(loadedMessages);
        setMessage("");
      };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat, teamChats]);

  const handleSendMessage = () => {
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
      try {
        
        // trim a message to get the email
        const trimmed = message.trim();

        // if user tries to discuss with one of the aiagents
        if (trimmed.startsWith("@")) {
          setIsProcessing(true);
          const validAgents = ["mr.gyb", "chris", "sherry", "charlotte", "jake", "rachel"];
          const parts = trimmed.trim().split(" ");
          const aiAgent = parts[0].substring(1).toLowerCase(); // removing @ with aiagnetName
          const question = parts.slice(1).join(" ");

          // for UI updates
          setIsProcessingAiAgent(aiAgent);

          // if it is not a vaild question
          if (!question) {
            alert("Please provide a message after the agent name!");
            return;
          }

          // if it is not a valid ai agent name
          if (!validAgents.includes(aiAgent)) {
            alert(
              'Agent "${aiAgnet}" is not available, please look at the help instruction at the top right corner to see the vaild ai agents'
            );
            return;
          }

          // 1. stores the user question
          await addDoc(
            collection(db, `dream_team_chat/${selectedChat}/messages`),
            {
              content: message,
              senderId: user?.uid,
              senderType: "user",
              timestamp: new Date().toISOString(),
            }
          );

          try {
            // 2. Retrieve the current message
            const messageQuery = query(
              collection(db, `dream_team_chat/${selectedChat}/messages`),
              orderBy("timestamp", "asc")
            );
            const snapshot = await getDocs(messageQuery);
            const chatHistory: OpenAIMessage[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                role: data.senderId === user?.uid ? "user" : "assistant",
                content: data.content,
              };
            });
            let upperaiAgent = "";
            if (aiAgent === "mr.gyb") {
              upperaiAgent = "Mr.GYB AI";
            } else {
              if (aiAgent === "chris"){
                upperaiAgent = "Chris"
              }
              if (aiAgent === "sherry"){
                upperaiAgent = "Sherry"
              }
              if (aiAgent === "charlotte"){
                upperaiAgent = "Charlotte"
              }
              if (aiAgent === "jake"){
                upperaiAgent = "Jake"
              }
              if (aiAgent === "rachel"){
                upperaiAgent = "Rachel"
              }
            }
            // 3.generate AI response
            const aiResponse = await generateAIResponse(
              [...chatHistory, { content: question }],
              upperaiAgent
            );

            // 4. Stores the response to the firebase
            await addDoc(
              collection(db, `dream_team_chat/${selectedChat}/messages`),
              {
                content: aiResponse,
                senderId: "ai",
                senderType: "assistant",
                aiAgent: upperaiAgent,
                timestamp: new Date().toISOString(),
              }
            );
            setIsProcessing(false);
            setIsProcessingAiAgent("");
            setMessage(""); //reset the text input area
          } catch (err) {
            console.error("Fail to generate AI reponse", err);
          }

          return;
        }

        // if user input starts with invitation
        if (trimmed.startsWith("/invite")) {
          const parts = trimmed.split(" ");
          if (parts.length < 2) {
            alert("Provide valid email");
            return;
          }
          const email = parts[1];
          await inviteUserByEmail(email, selectedChat);
          setMessage("");
          return;
        }

        // if user type /exit to delete the chatroom
        // Auotomatically move the selectedChat to the first room of the remaining chats
        if (trimmed.startsWith("/exit")) {
          const chatRef = doc(db, "dream_team_chat", selectedChat);
          await updateDoc(chatRef, {
            teamMembers: arrayRemove(user?.uid),
          });

          const remainingChats = teamChats.filter(
            (chat) => chat.id !== selectedChat
          );
          setSelectedChat(remainingChats[0]?.id);
          return;
        }

        addDoc(collection(db, `dream_team_chat/${selectedChat}/messages`), {
          content: message,
          senderId: user?.uid,
          senderType: "user",
          timestamp: new Date().toISOString(),
        });
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // inviting user through valid email
  // Getting the user information via email in profile field and
  // create chat_invitation field also add the inviting user to the teamMembers field.
  const inviteUserByEmail = async (email: string, chatId: string) => {
    const q = query(collection(db, "profiles"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert(`${email} IS NOT OUR USER`);
      return;
    }

    const invitedUserDoc = snapshot.docs[0];
    const invitedUid = invitedUserDoc.id;

    await addDoc(collection(db, "chat_invitations"), {
      chatId,
      invitedUid,
      invitedEmail: email,
      invitedBy: user?.uid,
      createdAt: serverTimestamp(),
    });

    // Add to the participants
    const chatRef = doc(db, "dream_team_chat", chatId);
    await updateDoc(chatRef, {
      teamMembers: arrayUnion(invitedUid),
    });

    setMessage("");
    //alert('user invited')
  };

  // Handling when user accept the invitation
  // Delete the chat_invitation data in the chat_invitations field.
  const handleAccept = async (invite: any) => {
    // 2. delete invitation
    await deleteDoc(doc(db, "chat_invitations", invite.id));
  };

  // Handling decline the invitation
  // delete the chat_invitaion and should delete this person from the teamMembers.
  const handleDecline = async (invite: any) => {
    // find the inviteId
    const invites = invitations.find((inv) => inv.id === invite.id);
    await deleteDoc(doc(db, "chat_invitations", invite.id));
    // If the inviteId is same as declined room then remove it
    if (invite && selectedChat === invite.chatId) {
      setSelectedChat(null);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

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
              <p className="text-sm text-gray-600 truncate">
                {chat.participants.join(', ')}
              </p>
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

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 bg-navy-blue text-white">
                      <p className="text-sm sm:text-base italic">
                        {`${processingAiAgnet} is thinking...`}
                      </p>
                    </div>
                  </div>
                )}

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


      {/* New Instruction model */}
      {showInsturction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative mt-[-40px]">
            <h2 className="text-xl font-bold mb-4">❓ How to Use</h2>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 mr-2 mt-3 text-xl"
              onClick={() => setshowInstruction(false)}
            >
              ❌
            </button>
            <h3 className="text-md font-semibold mb-2">
              1. Invitation Process
            </h3>
            <p className="mb-2">
              If you want to invite a team member, type the following command:
            </p>
            <pre className="bg-gray-100 text-sm text-black p-3 rounded-md overflow-x-auto mb-2">
              <code>/invite [email]</code>
            </pre>
            <p className="text-sm text-gray-600">
              Replace <code>[email]</code> with the team member's actual email.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              ex. /invite test@gmail.com
            </p>

            <h3 className="text-md font-semibold mb-2">
              2. Talk with AI agent
            </h3>
            <p className="mb-2">
              If you want to discuss or have a question to ai Agent, type the
              following command:
            </p>
            <pre className="bg-gray-100 text-sm text-black p-3 rounded-md overflow-x-auto mb-2">
              <code>@[aiAgent] [question]</code>
            </pre>
            <p className="text-sm text-gray-600 mb-2">
              Replace <code>[aiAgent]</code> with one of our aiAgent actual
              name.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xl">•</span>
              <span className="text-m font-medium text-black">Mr.GYB</span>
              <p className="text-sm text-gray-600">
                All-In-One Business Growth Assistant
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">•</span>
              <span className="text-m font-medium text-black">Chris</span>
              <p className="text-sm text-gray-600">
                Strategic Planning Assistant
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">•</span>
              <span className="text-m font-medium text-black">Jake</span>
              <p className="text-sm text-gray-600">
                Technology Strategy Assistant
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">•</span>
              <span className="text-m font-medium text-black">Charlotte</span>
              <p className="text-sm text-gray-600">
                Human Resources Management Assistant
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">•</span>
              <span className="text-m font-medium text-black">Rachel</span>
              <p className="text-sm text-gray-600">
                Marketing Strategy Assistant
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">•</span>
              <span className="text-m font-medium text-black">Sherry</span>
              <p className="text-sm text-gray-600">
                Operations Management Assistant
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4 mt-2">
              ex. @Jake How can I grow my business?
            </p>
            <h3 className="text-md font-semibold mb-2">3. Leave the room</h3>
            <p className="mb-2">
              If you want to leave the room, type the following command:
            </p>
            <pre className="bg-gray-100 text-sm text-black p-3 rounded-md overflow-x-auto mb-2">
              <code>/exit</code>
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};

export default GYBTeamChat;