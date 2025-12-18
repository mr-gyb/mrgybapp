# Group Chat Setup Guide

## Quick Start

1. **Navigate to Group Chat**: Click the "Culture" tab in the bottom menu (or go to `/group-chat`)

2. **Create a Group**:
   - Click the "+" button in the left panel
   - Enter a group name
   - Search and invite users by email
   - Select an AI agent (optional)
   - Click "Create Group"

3. **Start Chatting**:
   - Select a group from the left panel
   - Type a message and press Enter
   - AI agents will respond automatically if present

## Firestore Setup

### Required Indexes

Deploy the following indexes to Firestore:

```bash
firebase deploy --only firestore:indexes
```

The indexes are already defined in `firestore.indexes.json`:
- `group_chats`: `participantIds` (array-contains) + `updatedAt` (desc)
- `group_messages`: `groupId` (asc) + `timestamp` (asc)

### Security Rules

Security rules are already configured in `firestore.rules`. Deploy with:

```bash
firebase deploy --only firestore:rules
```

## Backend Endpoints

### New Endpoint: `/api/chat/non-streaming`

A non-streaming version of the chat endpoint specifically for group chat AI responses.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" },
    { "role": "user", "content": "How are you?" }
  ],
  "agent": "chris",
  "model": "o3-mini"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I'm doing great! How can I help you today?",
  "requestId": "uuid",
  "metadata": {
    "model": "o3-mini",
    "latencyMs": 1234
  }
}
```

## Testing

### Manual Test Flow

1. **Create Group**:
   - Open `/group-chat`
   - Click "+" to create group
   - Name: "Test Group"
   - Invite a user (search by email)
   - Select AI agent: "Chris"
   - Create

2. **Send Messages**:
   - Type: "Hello everyone!"
   - Send
   - Verify message appears
   - Wait for AI response (should appear automatically)

3. **Real-Time Test**:
   - Open same group in two browser windows
   - Send message in window 1
   - Verify it appears in window 2 immediately

## Troubleshooting

### "Group chat not found" Error
- Check Firestore rules are deployed
- Verify user is a participant in the group
- Check browser console for errors

### AI Not Responding
- Check backend `/api/chat/non-streaming` endpoint is working
- Verify agent ID is valid (check `AI_USERS` in `src/types/user.ts`)
- Check browser console for errors
- Verify OpenAI API key is configured

### Messages Not Appearing in Real-Time
- Check Firestore connection
- Verify `onSnapshot` listeners are active
- Check for network issues
- Verify Firestore indexes are created

### Firestore Index Errors
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Wait for index creation (can take a few minutes)
- Check Firebase Console for index status

## Architecture Notes

- **Real-Time**: Uses Firestore `onSnapshot` for real-time updates
- **AI Integration**: AI responses are triggered automatically when humans send messages
- **Scalability**: Designed to handle multiple groups and participants
- **Extensibility**: Easy to add features like typing indicators, read receipts, etc.

## Next Steps

1. Deploy Firestore indexes and rules
2. Test group creation and messaging
3. Verify AI responses work correctly
4. Test with multiple users in the same group

