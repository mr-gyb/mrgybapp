# Community Posts Feature - Test Plan

## Overview
This document outlines the test plan for the Community Posts feature including Create Post, Like, and Comment functionality with real-time updates.

## Test Scenarios

### 1. Create Post
**Prerequisites:**
- User A and User B are both authenticated
- Both users are on the Community tab (or `/gyb-live-network` route)

**Steps:**
1. User A navigates to `/community` tab (or `/gyb-live-network`)
2. User A clicks on "Feed" view (if not already selected)
3. User A types a post in the composer: "Hello from User A!"
4. User A optionally adds an image URL
5. User A clicks "Post" button

**Expected Results:**
- Post appears immediately in User A's feed
- Post appears in User B's feed in real-time (within 1-2 seconds)
- Post shows correct author name and avatar
- Post shows "just now" or "X seconds ago" timestamp
- Post has 0 likes and 0 comments initially
- Image displays correctly if image URL was provided

### 2. Like Post
**Prerequisites:**
- User A has created a post visible to User B

**Steps:**
1. User B sees User A's post in their feed
2. User B clicks the like button (heart icon)
3. User B observes the like count increment
4. User A refreshes or observes their own post

**Expected Results:**
- Like button turns red (filled) for User B
- Like count increments by 1 immediately (optimistic update)
- Like count increments for User A in real-time
- Like count persists after page refresh
- User A sees the updated like count on their post in real-time
- Double-clicking like button should unlike (toggle behavior)
- User B cannot like again (already liked state)

### 3. Comment on Post
**Prerequisites:**
- User A has created a post visible to User B

**Steps:**
1. User B clicks "Comments" button on User A's post
2. Comments panel expands
3. User B types a comment: "Great post!"
4. User B clicks send/enter
5. User A opens comments on their post

**Expected Results:**
- Comment appears immediately in User B's view
- Comment count increments by 1
- Comment appears in User A's view in real-time
- Comments show author name, text, and timestamp
- Comments are ordered chronologically (oldest first)
- Comment count updates for both users
- Multiple users can comment on the same post

### 4. Real-Time Updates
**Prerequisites:**
- User A and User B both have Community tab open

**Steps:**
1. User A creates a new post
2. User B observes feed without refreshing
3. User B likes the post
4. User A observes their post
5. User A comments on the post
6. User B observes the comment

**Expected Results:**
- Post appears in User B's feed automatically (within 1-2 seconds)
- No manual refresh required
- Like/comment updates appear in real-time for both users
- User A sees like count update immediately when User B likes
- User B sees comment appear immediately when User A comments

### 5. Persistence
**Prerequisites:**
- User A has created posts, User B has liked/commented

**Steps:**
1. Both users refresh the page
2. Users navigate away and return to Community tab

**Expected Results:**
- All posts are still visible
- Like status is preserved (liked posts show filled heart)
- Comment counts are correct
- All comments persist
- Timestamps are accurate
- Counts are accurate

### 6. Permissions and Validation
**Prerequisites:**
- User A has created a post
- User B is authenticated

**Steps:**
1. User B attempts to create a post
2. User B attempts to like User A's post
3. User B attempts to comment on User A's post
4. Try to create empty post
5. Try to add empty comment
6. Logged-out user views feed

**Expected Results:**
- User B can create posts (authenticated users can post)
- User B can like posts (authenticated users can like)
- User B can comment (authenticated users can comment)
- Empty post creation shows error message and disables post button
- Empty comment shows error message and disables send button
- Non-authenticated users see "Sign in to see the community feed" message
- No posts are visible to non-authenticated users

## Known Limitations

1. **Media Upload**: Currently only supports image URLs. No direct file upload to Firebase Storage.
2. **Notifications**: No push notifications for new posts, likes, or comments.
3. **Moderation**: No admin moderation tools or content filtering.
4. **Edit/Delete**: Users cannot edit or delete their posts/comments (future enhancement).
5. **User Mentions**: No @mention functionality for tagging users.
6. **Hashtags**: Tags are stored but not clickable/searchable yet.
7. **Pagination**: All posts are loaded at once (no pagination for large feeds). Feed shows last 50 posts; no infinite scroll or pagination.
8. **Nested Replies**: Comments are flat; no nested reply threads.
9. **Search/Filter**: No search or filter functionality for posts.

## Next Steps

1. **Media Upload**: Integrate Firebase Storage for direct image/video uploads
2. **Notifications**: Add real-time notifications for likes/comments
3. **Edit/Delete**: Allow users to edit/delete their own posts and comments
4. **Moderation**: Implement admin tools for content moderation
5. **User Mentions**: Add @mention functionality with notifications
6. **Hashtags**: Make tags clickable and searchable
7. **Pagination**: Implement infinite scroll or pagination for large feeds
8. **Rich Text**: Support markdown or rich text formatting
9. **Post Sharing**: Allow sharing posts to other platforms
10. **Post Reactions**: Add emoji reactions in addition to likes
11. **Nested Replies**: Implement nested comment reply threads
12. **Search/Filter**: Add search and filter functionality for posts
13. **Post Tags and Categories**: Add post tags and categories

## Test Environment

- **Firebase**: Production or emulator
- **Browsers**: Chrome, Firefox, Safari
- **Devices**: Desktop, Mobile (responsive)

## Notes

- All real-time updates should work within 1-2 seconds
- Like/comment counts should be consistent across all clients
- Error messages should be user-friendly
- Loading states should be shown during async operations

## Firestore Security Rules (For Maintainers)

```javascript
match /posts/{postId} {
  // Anyone authenticated can read
  allow read: if request.auth != null;
  
  // Anyone authenticated can create
  allow create: if request.auth != null 
    && request.resource.data.authorId == request.auth.uid;
  
  // Only owner can update/delete
  allow update, delete: if request.auth != null 
    && resource.data.authorId == request.auth.uid;
  
  // Likes subcollection
  match /likes/{userId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null 
      && userId == request.auth.uid;
    allow delete: if request.auth != null 
      && (userId == request.auth.uid || 
          get(/databases/$(database)/documents/posts/$(postId)).data.authorId == request.auth.uid);
  }
  
  // Comments subcollection
  match /comments/{commentId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null;
    allow delete: if request.auth != null 
      && (resource.data.authorId == request.auth.uid || 
          get(/databases/$(database)/documents/posts/$(postId)).data.authorId == request.auth.uid);
  }
}
```

## Testing Checklist

- [ ] Create post works
- [ ] Like post works (toggle)
- [ ] Unlike post works
- [ ] Comment on post works
- [ ] Real-time updates work for new posts
- [ ] Real-time updates work for likes
- [ ] Real-time updates work for comments
- [ ] Data persists after refresh
- [ ] URLs in posts are auto-linked
- [ ] Time formatting works correctly
- [ ] Empty states show correctly
- [ ] Loading states show correctly
- [ ] Error handling works (network errors, validation errors)
- [ ] Permissions work correctly (authenticated vs non-authenticated)
