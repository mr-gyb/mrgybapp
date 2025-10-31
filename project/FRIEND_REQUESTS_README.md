# Friend Requests & Notifications System

This document describes the implementation of the Friend Requests notifications flow and UI system.

## 🎯 Features Implemented

### 1. **Data Model (Firestore)**
- **users/{uid}** collection with:
  - `friends: string[]` - accepted friend UIDs
  - `pendingRequests: string[]` - incoming request UIDs  
  - `sentRequests: string[]` - outgoing request UIDs
  - `notifications: Notification[]` - notification objects

### 2. **Events Supported**
- ✅ **Send Request**: A → B (adds to pending/sent arrays, creates notification)
- ✅ **Accept Request**: B accepts A (moves to friends, creates chat room, notification)
- ✅ **Decline Request**: B declines A (removes from arrays, marks notifications read)

### 3. **UI Components**
- ✅ **FriendRequestsPanel**: Shows incoming/sent requests with Accept/Decline buttons
- ✅ **NotificationsBell**: Bell icon with unread count and dropdown
- ✅ **NetworkNotification**: Visual feedback for accepted friend requests
- ✅ **Team Chats Section**: Shows connected friends in real-time
- ✅ **Real-time Updates**: All components update in real-time using Firestore listeners

### 4. **Integration Points**
- ✅ **Community Page**: FriendRequestsPanel integrated in sidebar
- ✅ **Header**: NotificationsBell integrated in top bar
- ✅ **Context**: NotificationsProvider wraps the entire app

## 🏗️ Architecture

### Services
- **`src/services/friends.ts`**: Core friendship logic with optimistic updates
- **`src/services/notifications.ts`**: Notification management and watching
- **`src/contexts/NotificationsContext.tsx`**: Global notification state management

### Components
- **`src/components/community/FriendRequestsPanel.tsx`**: Main friend requests UI
- **`src/components/common/NotificationsBell.tsx`**: Notification bell with dropdown
- **`src/components/content/CommunityTab.tsx`**: Updated to include FriendRequestsPanel
- **`src/components/Header.tsx`**: Updated to include NotificationsBell

### Types
- **`src/types/friendships.ts`**: Added `AppNotification` interface

## 🧪 Testing

### Manual Testing Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the complete flow:**
   - Open two browser windows/tabs
   - Sign in as different users in each
   - Navigate to Community page
   - Send friend request from User A to User B
   - Verify User B sees notification in bell and friend requests panel
   - Accept/decline request from User B
   - Verify real-time updates on both sides

### Automated Testing

Run the test scripts to verify the backend logic:

```bash
# Test basic friendship flow
npm run test:friendship

# Test friend requests flow
npm run test:friend-requests

# Test enhanced features (real-time sync, notifications, etc.)
npm run test:enhanced-friend-requests
```

These will:
- Create test users
- Send friend requests
- Accept/decline requests  
- Test notifications
- Test real-time listeners
- Test friends list updates
- Verify all data is correctly stored in Firestore

### Testing Checklist

- [ ] **Send Request**: User A → User B
  - [ ] User A sees "Requested" status
  - [ ] User B sees incoming request in panel
  - [ ] User B gets notification in bell
  - [ ] Bell shows unread count

- [ ] **Accept Request**: User B accepts User A
  - [ ] Both users see each other in friends list
  - [ ] User A gets "request_accepted" notification
  - [ ] Chat room is automatically created
  - [ ] Request removed from pending/sent lists

- [ ] **Decline Request**: User B declines User A
  - [ ] Request removed from pending/sent lists
  - [ ] No friendship created
  - [ ] Notifications marked as read

- [ ] **Real-time Updates**
  - [ ] All changes appear immediately without refresh
  - [ ] Multiple users see updates simultaneously
  - [ ] Notifications update in real-time

- [ ] **UI/UX**
  - [ ] Friend requests panel shows correct counts
  - [ ] Bell shows unread notification count
  - [ ] Accept/Decline buttons work correctly
  - [ ] Loading states during operations
  - [ ] Error handling for failed operations

- [ ] **Enhanced Features**
  - [ ] **Auto-remove accepted users**: When request is accepted, user is removed from Incoming Requests and added to Team Chats
  - [ ] **Visual feedback**: Network notification appears saying "{username} has been added to your network"
  - [ ] **Notification badge**: Friend Requests section shows unread count badge
  - [ ] **Sent tab**: Displays all pending requests the current user has sent
  - [ ] **Live sync**: UI state syncs live using Firestore listeners
  - [ ] **Team Chats section**: Shows connected friends with status indicators

## 🔧 Configuration

### Environment Variables
Make sure your `.env.local` file contains:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firestore Security Rules
Ensure your Firestore rules allow:
- Users to read/write their own user documents
- Users to read other user profiles
- Users to create/read chat rooms where they are members

### Firestore Indexes
The following composite indexes are recommended:
```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "friends", "arrayConfig": "CONTAINS" },
        { "fieldPath": "updatedAt", "order": "desc" }
      ]
    }
  ]
}
```

## 🚀 Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform:**
   - The build output is in the `dist/` directory
   - All components are properly bundled and optimized

3. **Verify in production:**
   - Test the complete friend request flow
   - Verify real-time updates work
   - Check that notifications appear correctly

## 🐛 Troubleshooting

### Common Issues

1. **Notifications not appearing:**
   - Check that NotificationsProvider is wrapped around the app
   - Verify user is authenticated
   - Check Firestore security rules

2. **Real-time updates not working:**
   - Verify Firestore listeners are properly set up
   - Check for JavaScript errors in console
   - Ensure user has proper permissions

3. **Friend requests not sending:**
   - Check that both users exist in Firestore
   - Verify no duplicate requests exist
   - Check for validation errors

### Debug Mode

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'firebase:*');
```

## 📝 Notes

- All friend request operations use optimistic updates for better UX
- Notifications are automatically cleaned up when requests are accepted/declined
- The system prevents duplicate requests and self-requests
- Chat rooms are automatically created when friendships are established
- All components are fully responsive and accessible

## 🔄 Future Enhancements

- [ ] Push notifications for mobile
- [ ] Email notifications for friend requests
- [ ] Bulk friend request operations
- [ ] Friend request expiration
- [ ] Advanced notification filtering
- [ ] Friend suggestions based on mutual connections
