import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GroupChat, GroupChatMessage, GroupChatParticipant, CreateGroupChatInput, SenderType } from '../types/groupChat';
import { AI_USERS } from '../types/user';
import { getAuth } from 'firebase/auth';
import { getProfile } from '../services/profile.service';

// Collection references
const groupChatsCollection = collection(db, 'group_chats');
const groupMessagesCollection = collection(db, 'group_messages');

/**
 * Create a new group chat
 */
export async function createGroupChat(input: CreateGroupChatInput): Promise<GroupChat | null> {
  try {
    const { name, userId, invitedUserIds, selectedAgentId } = input;
    
    // Validate input
    if (!name || !name.trim()) {
      throw new Error('Group name is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if ((!invitedUserIds || invitedUserIds.length === 0) && !selectedAgentId) {
      throw new Error('At least one participant (user or AI agent) is required');
    }
    
    console.log('Creating group chat:', { name, userId, invitedUserIds, selectedAgentId });

    // Build participants array
    // First, try to get creator's display name
    let creatorDisplayName = 'You';
    let creatorAvatar: string | undefined;
    try {
      const creatorDoc = await getDoc(doc(collection(db, 'users'), userId));
      if (creatorDoc.exists()) {
        const creatorData = creatorDoc.data();
        creatorDisplayName = creatorData.name || creatorData.displayName || creatorData.email?.split('@')[0] || 'You';
        creatorAvatar = creatorData.profile_image_url || creatorData.photoURL || undefined;
      }
    } catch (error) {
      console.warn('Could not fetch creator profile:', error);
    }
    
    // Create creator participant object, only including avatar if it exists
    // Note: Cannot use serverTimestamp() inside arrays, so use Timestamp.now()
    const creatorParticipant: GroupChatParticipant = {
      id: userId,
      type: 'human',
      displayName: creatorDisplayName,
      joinedAt: Timestamp.now(),
    };
    if (creatorAvatar) {
      creatorParticipant.avatar = creatorAvatar;
    }
    
    const participants: GroupChatParticipant[] = [creatorParticipant];

    // Add invited human users
    for (const invitedUserId of invitedUserIds) {
      // Try to fetch user profile for displayName and avatar
      let displayName = `User ${invitedUserId.substring(0, 8)}`;
      let avatar: string | undefined;
      
      try {
        const userDoc = await getDoc(doc(collection(db, 'users'), invitedUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          displayName = userData.name || userData.displayName || userData.email?.split('@')[0] || displayName;
          avatar = userData.profile_image_url || userData.photoURL || undefined;
        }
      } catch (error) {
        console.warn('Could not fetch user profile for', invitedUserId, error);
        // Continue with placeholder name
      }
      
      // Create participant object, only including avatar if it exists
      // Note: Cannot use serverTimestamp() inside arrays, so use Timestamp.now()
      const participant: GroupChatParticipant = {
        id: invitedUserId,
        type: 'human',
        displayName,
        joinedAt: Timestamp.now(),
      };
      if (avatar) {
        participant.avatar = avatar;
      }
      
      participants.push(participant);
    }

    // Add selected AI agent if provided
    if (selectedAgentId && AI_USERS[selectedAgentId]) {
      const agent = AI_USERS[selectedAgentId];
      // Note: Cannot use serverTimestamp() inside arrays, so use Timestamp.now()
      const aiParticipant: GroupChatParticipant = {
        id: selectedAgentId,
        type: 'ai',
        displayName: agent.name,
        joinedAt: Timestamp.now(),
      };
      if (agent.profile_image_url) {
        aiParticipant.avatar = agent.profile_image_url;
      }
      participants.push(aiParticipant);
    }

    // Create group chat document
    // Also store participant IDs as a simple array for querying
    const participantIds = participants.map(p => p.id);
    
    // Build document data, ensuring no undefined values
    const groupChatData: any = {
      name: name.trim(),
      createdBy: userId,
      participants: participants.map(p => {
        // Remove any undefined fields from participant objects
        const participantData: any = {
          id: p.id,
          type: p.type,
          displayName: p.displayName,
          joinedAt: p.joinedAt,
        };
        if (p.avatar) {
          participantData.avatar = p.avatar;
        }
        return participantData;
      }),
      participantIds, // Simple string array for querying
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    console.log('Adding group chat document to Firestore...', {
      name: groupChatData.name,
      createdBy: groupChatData.createdBy,
      participantCount: groupChatData.participants.length,
      participantIds: groupChatData.participantIds,
    });
    
    const groupChatRef = await addDoc(groupChatsCollection, groupChatData);
    console.log('✅ Group chat document created with ID:', groupChatRef.id);

    const result: GroupChat = {
      id: groupChatRef.id,
      name,
      createdBy: userId,
      participants,
      createdAt: groupChatData.createdAt as Timestamp,
      updatedAt: groupChatData.updatedAt as Timestamp,
    };
    
    console.log('✅ Group chat created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Error creating group chat:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });
    
    // Re-throw with more context
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please deploy Firestore rules: firebase deploy --only firestore:rules');
    } else if (error?.code === 'unauthenticated') {
      throw new Error('You must be logged in to create a group chat');
    } else if (error?.message) {
      throw new Error(`Failed to create group chat: ${error.message}`);
    } else {
      throw new Error('Failed to create group chat. Check console for details.');
    }
  }
}

/**
 * Get all group chats for a user
 */
export async function getUserGroupChats(userId: string): Promise<GroupChat[]> {
  try {
    // Query groups where user is a participant (using participantIds array)
    const q = query(
      groupChatsCollection,
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const groupChats: GroupChat[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Check if user is actually a participant
      const participants = data.participants || [];
      const isParticipant = participants.some((p: GroupChatParticipant) => p.id === userId);
      
      if (isParticipant) {
        // Get last message for preview - never fail if this errors
        let lastMessage: GroupChatMessage | null = null;
        try {
          lastMessage = await getLastMessage(docSnap.id);
        } catch (error) {
          console.warn('Failed to get last message for group', docSnap.id, '- continuing without it');
          // Continue without last message - don't block group creation
        }
        
        groupChats.push({
          id: docSnap.id,
          name: data.name,
          createdBy: data.createdBy,
          participants,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastMessageAt: lastMessage?.timestamp || null,
          lastMessage: lastMessage?.content || '',
          lastMessageSender: lastMessage?.displayName || '',
        });
      }
    }

    return groupChats;
  } catch (error: any) {
    // Handle index errors gracefully - fallback to query without orderBy
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.warn('Firestore index required for user group chats. Using fallback query.');
      try {
        // Fallback: query without orderBy
        const fallbackQuery = query(
          groupChatsCollection,
          where('participantIds', 'array-contains', userId)
        );
        const snapshot = await getDocs(fallbackQuery);
        const groupChats: GroupChat[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const participants = data.participants || [];
          const isParticipant = participants.some((p: GroupChatParticipant) => p.id === userId);
          
          if (isParticipant) {
            // Get last message for preview - never fail if this errors
            let lastMessage: GroupChatMessage | null = null;
            try {
              lastMessage = await getLastMessage(docSnap.id);
            } catch (err) {
              console.warn('Failed to get last message for group', docSnap.id);
            }
            
            groupChats.push({
              id: docSnap.id,
              name: data.name,
              createdBy: data.createdBy,
              participants,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              lastMessageAt: lastMessage?.timestamp || null,
              lastMessage: lastMessage?.content || '',
              lastMessageSender: lastMessage?.displayName || '',
            });
          }
        }
        
        // Sort client-side by updatedAt
        return groupChats.sort((a, b) => {
          const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : new Date(a.updatedAt as string).getTime();
          const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : new Date(b.updatedAt as string).getTime();
          return bTime - aTime; // Descending
        });
      } catch (fallbackError) {
        console.warn('Fallback query also failed for user group chats:', fallbackError);
        return []; // Safe fallback - return empty array
      }
    }
    console.error('Error getting user group chats:', error);
    return []; // Safe fallback - never throw, always return empty array
  }
}

/**
 * Get a single group chat by ID
 */
export async function getGroupChat(groupId: string): Promise<GroupChat | null> {
  try {
    const docSnap = await getDoc(doc(groupChatsCollection, groupId));
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      createdBy: data.createdBy,
      participants: data.participants || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error getting group chat:', error);
    throw error;
  }
}

/**
 * Get display name for a sender, checking multiple sources
 */
async function getSenderDisplayName(
  senderId: string,
  senderType: SenderType,
  groupChat?: GroupChat | null
): Promise<{ displayName: string; avatar?: string }> {
  // For AI agents, use AI_USERS
  if (senderType === 'ai') {
    const agent = AI_USERS[senderId];
    if (agent) {
      return {
        displayName: agent.name,
        avatar: agent.profile_image_url || undefined,
      };
    }
    // Fallback for unknown AI agent
    return { displayName: 'AI Agent' };
  }

  // For humans, check multiple sources in priority order:
  
  // 1. Check group participants first (they already have display names)
  if (groupChat) {
    const participant = groupChat.participants.find((p) => p.id === senderId);
    if (participant && participant.displayName && participant.displayName !== `User ${senderId.substring(0, 8)}`) {
      return {
        displayName: participant.displayName,
        avatar: participant.avatar,
      };
    }
  }

  // 2. Try to get from users collection
  try {
    const userDoc = await getDoc(doc(collection(db, 'users'), senderId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const name = userData.name || userData.displayName || userData.email?.split('@')[0];
      if (name && !name.startsWith('User ')) {
        return {
          displayName: name,
          avatar: userData.profile_image_url || userData.photoURL || undefined,
        };
      }
    }
  } catch (error) {
    console.warn('Could not fetch from users collection for', senderId, error);
  }

  // 3. Try to get from profiles collection
  try {
    const profile = await getProfile(senderId);
    if (profile && profile.name && !profile.name.startsWith('User ')) {
      return {
        displayName: profile.name,
        avatar: profile.profile_image_url || undefined,
      };
    }
  } catch (error) {
    console.warn('Could not fetch profile for', senderId, error);
  }

  // 4. Try Firebase Auth (for current user)
  try {
    const auth = getAuth();
    if (auth.currentUser && auth.currentUser.uid === senderId) {
      const displayName = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0];
      if (displayName) {
        return {
          displayName,
          avatar: auth.currentUser.photoURL || undefined,
        };
      }
    }
  } catch (error) {
    console.warn('Could not fetch from auth for', senderId, error);
  }

  // 5. Final fallback - never show raw UID
  return { displayName: 'Guest User' };
}

export async function sendGroupMessage(
  groupId: string,
  senderId: string,
  senderType: SenderType,
  content: string
): Promise<GroupChatMessage | null> {
  try {
    // Get group chat to check participants
    const groupChat = await getGroupChat(groupId);
    
    // Get sender info using improved lookup
    const { displayName, avatar } = await getSenderDisplayName(senderId, senderType, groupChat);

    // Create message - only include avatar if it exists (Firebase doesn't allow undefined)
    const messageData: any = {
      groupId,
      senderId,
      senderType,
      content,
      displayName,
      timestamp: serverTimestamp(),
    };
    
    // Only add avatar if it exists
    if (avatar) {
      messageData.avatar = avatar;
    }

    const messageRef = await addDoc(groupMessagesCollection, messageData);

    // Update group chat's updatedAt and lastMessage
    await updateDoc(doc(groupChatsCollection, groupId), {
      updatedAt: serverTimestamp(),
      lastMessage: content,
      lastMessageSender: displayName,
      lastMessageAt: serverTimestamp(),
    });

    const result: GroupChatMessage = {
      id: messageRef.id,
      groupId,
      senderId,
      senderType,
      content,
      displayName,
      timestamp: messageData.timestamp as Timestamp,
    };
    
    // Only include avatar if it exists
    if (avatar) {
      result.avatar = avatar;
    }
    
    return result;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
}

/**
 * Enrich message with display name if missing
 */
async function enrichMessageDisplayName(
  message: GroupChatMessage,
  groupChat?: GroupChat | null
): Promise<GroupChatMessage> {
  // If message already has a proper display name (not raw UID), return as-is
  if (message.displayName && !message.displayName.startsWith('User ') && message.displayName !== 'Unknown') {
    return message;
  }

  // Get display name using the same logic as sendGroupMessage
  const { displayName, avatar } = await getSenderDisplayName(message.senderId, message.senderType, groupChat);
  
  return {
    ...message,
    displayName,
    avatar: avatar || message.avatar,
  };
}

/**
 * Get messages for a group chat
 */
export async function getGroupMessages(groupId: string): Promise<GroupChatMessage[]> {
  try {
    const q = query(
      groupMessagesCollection,
      where('groupId', '==', groupId),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as GroupChatMessage[];

    // Get group chat for participant lookup
    const groupChat = await getGroupChat(groupId).catch(() => null);
    
    // Enrich all messages with display names
    const enrichedMessages = await Promise.all(
      messages.map((msg) => enrichMessageDisplayName(msg, groupChat))
    );
    
    return enrichedMessages;
  } catch (error: any) {
    // Handle index errors gracefully - fallback to query without orderBy
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.warn('Firestore index required for group messages. Using fallback query.');
      try {
        // Fallback: query without orderBy
        const fallbackQuery = query(
          groupMessagesCollection,
          where('groupId', '==', groupId)
        );
        const snapshot = await getDocs(fallbackQuery);
        const messages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as GroupChatMessage[];
        // Sort client-side
        return messages.sort((a, b) => {
          const aTime = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp as string).getTime();
          const bTime = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp as string).getTime();
          return aTime - bTime;
        });
      } catch (fallbackError) {
        console.warn('Fallback query also failed for group messages:', fallbackError);
        return []; // Safe fallback - return empty array instead of crashing
      }
    }
    console.error('Error getting group messages:', error);
    return []; // Safe fallback - never throw, always return empty array
  }
}

/**
 * Subscribe to real-time messages for a group chat
 */
export function subscribeToGroupMessages(
  groupId: string,
  callback: (messages: GroupChatMessage[]) => void
): () => void {
  // Try the indexed query first
  let q = query(
    groupMessagesCollection,
    where('groupId', '==', groupId),
    orderBy('timestamp', 'asc')
  );

  // Cache group chat for participant lookup
  let cachedGroupChat: GroupChat | null = null;
  const loadGroupChat = async () => {
    try {
      cachedGroupChat = await getGroupChat(groupId);
    } catch (error) {
      console.warn('Could not load group chat for participant lookup:', error);
    }
  };
  loadGroupChat(); // Load immediately

  return onSnapshot(q, async (snapshot) => {
    const messages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as GroupChatMessage[];
    
    // Enrich messages with display names
    const enrichedMessages = await Promise.all(
      messages.map((msg) => enrichMessageDisplayName(msg, cachedGroupChat))
    );
    
    callback(enrichedMessages);
  }, (error: any) => {
    // Handle index errors gracefully - fallback to query without orderBy
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.warn('Firestore index required for group messages subscription. Using fallback query.');
      // Fallback: query without orderBy
      const fallbackQuery = query(
        groupMessagesCollection,
        where('groupId', '==', groupId)
      );
      
      // Ensure group chat is loaded for fallback (async, but don't await)
      if (!cachedGroupChat) {
        loadGroupChat().catch(() => {});
      }
      
      // Set up fallback subscription
      return onSnapshot(fallbackQuery, async (snapshot) => {
        const messages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as GroupChatMessage[];
        
        // Enrich messages with display names
        const enrichedMessages = await Promise.all(
          messages.map((msg) => enrichMessageDisplayName(msg, cachedGroupChat))
        );
        
        // Sort client-side
        const sorted = enrichedMessages.sort((a, b) => {
          const aTime = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp as string).getTime();
          const bTime = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp as string).getTime();
          return aTime - bTime;
        });
        callback(sorted);
      }, (fallbackError) => {
        console.warn('Fallback subscription also failed:', fallbackError);
        callback([]); // Safe fallback - return empty array
      });
    }
    console.error('Error in group messages subscription:', error);
    callback([]); // Safe fallback - never crash, return empty array
  });
}

/**
 * Subscribe to real-time group chats list for a user
 */
export function subscribeToUserGroupChats(
  userId: string,
  callback: (groupChats: GroupChat[]) => void
): () => void {
  // Query groups where user is a participant (using participantIds array)
  const q = query(
    groupChatsCollection,
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
    limit(50) // Limit to prevent too much data
  );

  return onSnapshot(q, async (snapshot) => {
    const groupChats: GroupChat[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const participants = data.participants || [];
      
      // Check if user is a participant
      const isParticipant = participants.some((p: GroupChatParticipant) => p.id === userId);
      
      if (isParticipant) {
        // Get last message for preview - never fail if this errors
        let lastMessage: GroupChatMessage | null = null;
        try {
          lastMessage = await getLastMessage(docSnap.id);
        } catch (err) {
          console.warn('Failed to get last message for group', docSnap.id, '- continuing without it');
        }
        
        groupChats.push({
          id: docSnap.id,
          name: data.name,
          createdBy: data.createdBy,
          participants,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          lastMessageAt: lastMessage?.timestamp || null,
          lastMessage: lastMessage?.content || '',
          lastMessageSender: lastMessage?.displayName || '',
        });
      }
    }

    callback(groupChats);
  }, (error) => {
    console.error('Error in group chats subscription:', error);
    callback([]);
  });
}

/**
 * Get last message for a group chat (helper function)
 */
// Track if we've already logged the index warning (suppress spam)
let lastMessageIndexWarningLogged = false;

/**
 * Get last message for a group chat (helper function)
 * 
 * Requires composite index on group_messages:
 * - Collection: group_messages
 * - Fields: groupId (ASC), timestamp (DESC)
 * 
 * Query structure:
 * - where("groupId", "==", groupId)
 * - orderBy("timestamp", "desc")
 * - limit(1)
 */
async function getLastMessage(groupId: string): Promise<GroupChatMessage | null> {
  try {
    // Primary query with index
    // Requires composite index on group_messages: groupId ASC, timestamp DESC
    const q = query(
      groupMessagesCollection,
      where('groupId', '==', groupId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const message = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as GroupChatMessage;
    
    // Enrich with display name
    const groupChat = await getGroupChat(groupId).catch(() => null);
    return await enrichMessageDisplayName(message, groupChat);
  } catch (error: any) {
    // Handle index errors gracefully - fallback to query without orderBy
    // Only run fallback if this is specifically an index error
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      // Log warning only once per session to avoid spam
      if (!lastMessageIndexWarningLogged) {
        console.warn('⚠️ Firestore index missing for lastMessage — using fallback (this warning will not repeat)');
        console.warn('   Create index: group_messages collection, fields: groupId (ASC), timestamp (DESC)');
        lastMessageIndexWarningLogged = true;
      }
      
      try {
        // Fallback: query without orderBy (no index required)
        // Same where filter, but no orderBy
        const fallbackQuery = query(
          groupMessagesCollection,
          where('groupId', '==', groupId)
          // No orderBy - will sort client-side
        );
        const snapshot = await getDocs(fallbackQuery);
        if (snapshot.empty) {
          return null;
        }
        
        // Sort by timestamp client-side and get the last one
        const messages = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as GroupChatMessage[];
        
        const sorted = messages.sort((a, b) => {
          const aTime = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp as string).getTime();
          const bTime = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp as string).getTime();
          return bTime - aTime; // Descending
        });
        
        return sorted[0] || null;
      } catch (fallbackError) {
        // Fallback also failed - return null silently
        return null; // Safe fallback - return null instead of crashing
      }
    }
    // Non-index error - return null silently
    return null; // Safe fallback - never throw, always return null
  }
}

/**
 * Add a participant to an existing group chat
 */
export async function addParticipantToGroup(
  groupId: string,
  participantId: string,
  participantType: SenderType
): Promise<void> {
  try {
    const groupChatRef = doc(groupChatsCollection, groupId);
    const groupChatSnap = await getDoc(groupChatRef);

    if (!groupChatSnap.exists()) {
      throw new Error('Group chat not found');
    }

    const data = groupChatSnap.data();
    const participants = data.participants || [];

    // Check if participant already exists
    const exists = participants.some((p: GroupChatParticipant) => p.id === participantId);
    if (exists) {
      return; // Already a participant
    }

    // Create new participant
    let displayName = 'Unknown';
    let avatar: string | undefined;

    if (participantType === 'ai') {
      const agent = AI_USERS[participantId];
      if (agent) {
        displayName = agent.name;
        avatar = agent.profile_image_url;
      }
    } else {
      // Try to fetch user profile
      try {
        const userDoc = await getDoc(doc(collection(db, 'users'), participantId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          displayName = userData.name || userData.displayName || userData.email?.split('@')[0] || `User ${participantId.substring(0, 8)}`;
          avatar = userData.profile_image_url || userData.photoURL || avatar;
        } else {
          displayName = `User ${participantId.substring(0, 8)}`;
        }
      } catch (error) {
        console.warn('Could not fetch user profile for', participantId, error);
        displayName = `User ${participantId.substring(0, 8)}`;
      }
    }

    const newParticipant: GroupChatParticipant = {
      id: participantId,
      type: participantType,
      displayName,
      avatar,
      joinedAt: Timestamp.now(),
    };

    await updateDoc(groupChatRef, {
      participants: arrayUnion(newParticipant),
      participantIds: arrayUnion(participantId), // Also update participantIds array
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
}

