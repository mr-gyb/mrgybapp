# Group Chat - Quick Start Guide

## Prerequisites

1. **Firebase CLI installed**: `npm install -g firebase-tools`
2. **Node.js** (v18+ recommended)
3. **Firebase project** configured
4. **OpenAI API key** in your `.env` file

## Step 1: Deploy Firestore Indexes

The group chat requires Firestore indexes for efficient queries. Deploy them:

```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
firebase deploy --only firestore:indexes
```

**Note**: Index creation can take a few minutes. Check status in Firebase Console.

## Step 2: Deploy Firestore Security Rules

Deploy the security rules for group chats:

```bash
firebase deploy --only firestore:rules
```

## Step 3: Start the Backend Server

Open a terminal and start the backend:

```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project/backend
npm start
```

You should see:
```
🚀 Voice Chat Backend Server Started!
📡 Server running on http://localhost:8080
...
🎥 Video Shorts Generator endpoint: http://localhost:8080/api/video/shorts
📹 OpenAI Video Analysis endpoint: http://localhost:8080/api/descript/upload
```

## Step 4: Start the Frontend

Open a **new terminal** and start the frontend:

```bash
cd /Users/darshparikh/Documents/GitHub/mrgybapp/project
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3002/
```

## Step 5: Access Group Chat

1. Open your browser and go to: `http://localhost:3002`
2. **Login** (if not already logged in)
3. Click the **"Culture"** tab in the bottom menu
   - OR navigate directly to: `http://localhost:3002/group-chat`

## Step 6: Create Your First Group Chat

1. Click the **"+"** button in the left panel
2. Enter a group name (e.g., "Team Discussion")
3. **Invite Users** (optional):
   - Type an email in the search box
   - Click on a user to add them
4. **Select an AI Agent** (optional):
   - Choose from available agents (Chris, Mr.GYB AI, etc.)
5. Click **"Create Group"**

## Step 7: Start Chatting

1. Select your group from the left panel
2. Type a message in the input field
3. Press **Enter** or click **Send**
4. If you added an AI agent, it will respond automatically!

## Troubleshooting

### Backend Not Starting

**Error: Port 8080 already in use**
```bash
# Kill the process using port 8080
lsof -ti:8080 | xargs kill -9

# Or change the port in backend/.env
PORT=8081
```

**Error: Missing environment variables**
- Make sure `backend/.env` has:
  ```
  OPENAI_API_KEY=your_key_here
  PORT=8080
  CHAT_API_BASE=https://api.openai.com/v1
  MODEL_NAME=o3-mini
  ```

### Frontend Not Starting

**Error: Port 3002 already in use**
```bash
# Kill the process
lsof -ti:3002 | xargs kill -9

# Or change port in vite.config.ts
```

**Error: Module not found**
```bash
# Reinstall dependencies
npm install
```

### Firestore Index Errors

**Error: "The query requires an index"**
1. Go to Firebase Console → Firestore → Indexes
2. Click the link in the error message to create the index
3. Wait for index to build (can take a few minutes)

**Or deploy indexes manually:**
```bash
firebase deploy --only firestore:indexes
```

### AI Not Responding

1. **Check backend is running**: `http://localhost:8080/api/chat/health`
2. **Check OpenAI API key** is set in `backend/.env`
3. **Check browser console** for errors
4. **Verify agent ID** is valid (check `src/types/user.ts` for available agents)

### Messages Not Appearing

1. **Check Firestore rules** are deployed
2. **Check browser console** for permission errors
3. **Verify user is logged in**
4. **Check Firestore connection** in Firebase Console

## Testing with Multiple Users

To test real-time updates:

1. **Open two browser windows** (or use incognito mode)
2. **Login as different users** in each window
3. **Create a group** and invite both users
4. **Send a message** in window 1
5. **Verify it appears** in window 2 immediately

## Available AI Agents

You can select from these AI agents when creating a group:

- **Mr.GYB AI** (`mr-gyb-ai` or `mrgyb`) - Business growth assistant
- **Chris** (`chris`) - CEO AI, strategic planning
- **Sherry** (`sherry`) - COO AI, operations management
- **Devin** (`devin`) - Engineering/Technology lead
- **Jake** (`jake`) - Tech Expert
- **Charlotte** (`charlotte`) - CHRO, Human Resources
- **Alex** (`alex`) - Operations Expert

## Quick Commands Reference

```bash
# Start backend
cd project/backend && npm start

# Start frontend (in new terminal)
cd project && npm run dev

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Check backend health
curl http://localhost:8080/api/chat/health
```

## Next Steps

Once everything is running:

1. ✅ Create a test group
2. ✅ Invite a user (or use a second account)
3. ✅ Add an AI agent
4. ✅ Send messages and verify AI responds
5. ✅ Test real-time updates in multiple windows

Enjoy your group chat feature! 🎉

