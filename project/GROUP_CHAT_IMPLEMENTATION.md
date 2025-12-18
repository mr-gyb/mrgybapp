# Group Chat with AI Agents - Implementation Guide

## Overview
This document describes the real-time group chat feature that allows human users and AI agents to participate in shared conversation threads within the Culture tab.

## Architecture

### Data Model

#### Firestore Collections

1. **`group_chats`** - Group chat metadata
   ```typescript
   {
     id: string;
     name: string;
     createdBy: string; // user_id
     participants: GroupChatParticipant[];
     participantIds: string[]; // Simple array for querying
     createdAt: Timestamp;
     updatedAt: Timestamp;
     lastMessage?: string;
     lastMessageSender?: string;
     lastMessageAt?: Timestamp;
   }
   ```

2. **`group_messages`** - Messages in group chats
   ```typescript
   {
     id: string;
     groupId: string;
     senderId: string; // user_id or agent_id
     senderType: 'human' | 'ai';
     content: string;
     displayName: string;
     avatar?: string;
     timestamp: Timestamp;
   }
   ```

3. **`group_participants`** - Embedded in group_chats document
   ```typescript
   {
     id: string; // user_id or agent_id
     type: 'human' | 'ai';
     displayName: string;
     avatar?: string;
     joinedAt: Timestamp;
   }
   ```

### Components

1. **`GroupChatView.tsx`** - Main group chat interface
   - Left panel: List of group chats
   - Right panel: Active chat thread with messages
   - Message input at bottom

2. **`CreateGroupModal.tsx`** - Modal for creating new groups
   - Group name input
   - User search and invite
   - AI agent selection

3. **`useGroupChat.ts`** - React hook for group chat state management
   - Manages group chats list
   - Handles message sending
   - Triggers AI responses
   - Real-time subscriptions

### Services

1. **`groupChat.service.ts`** - Firestore operations
   - `createGroupChat()` - Create new group
   - `getUserGroupChats()` - Get user's groups
   - `sendGroupMessage()` - Send message
   - `subscribeToGroupMessages()` - Real-time message updates
   - `subscribeToUserGroupChats()` - Real-time group list updates

## Features

### 1. Group Creation
- User can create a group with a custom name
- Invite other registered users (search by email)
- Select one AI agent from available agents
- All participants are added to the same conversation thread

### 2. Real-Time Messaging
- Messages update in real-time for all participants
- Uses Firestore `onSnapshot` listeners
- No page refresh needed
- Messages appear instantly

### 3. AI Agent Integration
- AI agents respond automatically when humans send messages
- AI responses appear as normal chat messages
- AI messages are attributed with agent name and avatar
- Uses existing backend `/api/chat` endpoint with agent parameter

### 4. Message Display
- Messages show:
  - Sender avatar
  - Display name
  - Message content
  - Timestamp (relative time)
  - Visual distinction between human and AI messages
- Current user's messages appear on the right
- Other participants' messages appear on the left

## Usage

### Creating a Group Chat

1. Navigate to Culture tab (or `/group-chat`)
2. Click the "+" button in the left panel
3. Enter group name
4. Search and invite users by email
5. Select an AI agent (optional)
6. Click "Create Group"

### Sending Messages

1. Select a group chat from the left panel
2. Type message in the input field
3. Press Enter or click Send
4. Message appears immediately
5. If AI agent is present, it responds automatically

### AI Agent Behavior

- AI only responds when a human sends a message
- AI uses conversation history (last 10 messages) for context
- AI responses are sent as normal messages in the thread
- No special labeling - AI appears as a regular participant

## Technical Details

### Real-Time Updates

```typescript
// Subscribe to messages
const unsubscribe = subscribeToGroupMessages(groupId, (messages) => {
  setMessages(messages);
});

// Subscribe to group list
const unsubscribe = subscribeToUserGroupChats(userId, (groups) => {
  setGroupChats(groups);
});
```

### AI Response Flow

1. Human sends message → `sendGroupMessage()` called
2. Message saved to Firestore
3. Hook detects AI agent in group
4. `triggerAIResponse()` called asynchronously
5. Backend `/api/chat` endpoint called with:
   - Conversation history (last 10 messages)
   - Current message
   - Agent ID for system prompt
6. AI response received
7. AI response saved as message via `sendGroupMessage()`
8. All participants see AI response in real-time

### Firestore Security Rules

```javascript
// Group chats - participants can read/write
match /group_chats/{groupId} {
  allow read: if isGroupChatParticipant(groupId);
  allow create: if request.auth.uid == request.resource.data.createdBy;
  allow update: if isGroupChatParticipant(groupId);
}

// Group messages - participants can read, senders can create
match /group_messages/{messageId} {
  allow read: if isGroupChatParticipant(resource.data.groupId);
  allow create: if isGroupChatParticipant(request.resource.data.groupId);
}
```

### Firestore Indexes Required

1. **group_chats**:
   - `participantIds` (array-contains) + `updatedAt` (desc)

2. **group_messages**:
   - `groupId` (asc) + `timestamp` (asc)

## Future Enhancements

1. **Natural AI Timing**: AI agents can interject spontaneously based on conversation flow
2. **Multiple AI Agents**: Support for multiple AI agents in one group
3. **Message Reactions**: Emoji reactions to messages
4. **File Attachments**: Support for images, documents, etc.
5. **Typing Indicators**: Show when participants are typing
6. **Read Receipts**: Show when messages are read
7. **Group Settings**: Mute notifications, leave group, etc.
8. **Message Search**: Search messages within a group
9. **Mentions**: @mention users or AI agents
10. **Thread Replies**: Reply to specific messages

## Testing

### Manual Testing Steps

1. **Create Group**:
   - Create a group with name "Test Group"
   - Invite another user
   - Select an AI agent (e.g., "Chris")
   - Verify group appears in list

2. **Send Messages**:
   - Send a message as user 1
   - Verify message appears immediately
   - Verify AI responds automatically
   - Open group as user 2
   - Verify all messages are visible

3. **Real-Time Updates**:
   - Open same group in two browser windows
   - Send message in window 1
   - Verify message appears in window 2 without refresh

4. **AI Responses**:
   - Send various message types
   - Verify AI responses are contextually relevant
   - Verify AI responses appear as normal messages

## Troubleshooting

### Messages Not Appearing
- Check Firestore security rules
- Verify user is a participant in the group
- Check browser console for errors
- Verify Firestore indexes are created

### AI Not Responding
- Check backend `/api/chat` endpoint is working
- Verify agent ID is valid
- Check browser console for errors
- Verify OpenAI API key is configured

### Real-Time Updates Not Working
- Check Firestore connection
- Verify `onSnapshot` listeners are set up
- Check for network issues
- Verify Firestore rules allow reads

## Files Created/Modified

### New Files
- `src/types/groupChat.ts` - Type definitions
- `src/services/groupChat.service.ts` - Firestore operations
- `src/hooks/useGroupChat.ts` - React hook
- `src/components/groupChat/GroupChatView.tsx` - Main UI
- `src/components/groupChat/CreateGroupModal.tsx` - Creation modal

### Modified Files
- `src/App.tsx` - Added route for `/group-chat`
- `src/components/BottomMenu.tsx` - Updated Culture tab navigation
- `firestore.rules` - Added security rules for group chats
- `firestore.indexes.json` - Added indexes for queries

## Route

The group chat feature is accessible at:
- **Route**: `/group-chat`
- **Navigation**: Culture tab in bottom menu

