# Community Posts Test Plan

## Overview
This document outlines the testing steps for the Community Posts feature, including Create Post, Like, and Comment functionality with real-time updates.

## Test Scenarios

### 1. Two-Account Test: Post Creation and Visibility

**Setup:**
- User A and User B both logged in
- User A on `/gyb-live-network` or Community tab
- User B on separate browser/device

**Steps:**
1. User A creates a post with text content
   - ✅ Verify post appears immediately in User A's feed
   - ✅ Verify post appears in User B's feed (real-time update)
   - ✅ Verify post shows correct author name and avatar
   - ✅ Verify timestamp shows "Just now" or "X seconds ago"

2. User A creates a post with image URL
   - ✅ Verify image displays correctly in the post
   - ✅ Verify post appears for both users

3. User B creates a post
   - ✅ Verify post appears for User A immediately (real-time)

### 2. Like Functionality

**Steps:**
1. User B likes User A's post
   - ✅ Verify like count increments for User B
   - ✅ Verify like count increments for User A (real-time)
   - ✅ Verify heart icon fills in for User B
   - ✅ Verify User B cannot like again (already liked)

2. User B unlikes the post
   - ✅ Verify like count decrements for both users
   - ✅ Verify heart icon unfills for User B

3. User A likes their own post
   - ✅ Verify like count increments
   - ✅ Verify heart icon fills

### 3. Comment Functionality

**Steps:**
1. User B comments on User A's post
   - ✅ Verify comment appears immediately for User B
   - ✅ Verify comment appears for User A (real-time)
   - ✅ Verify comment count increments for both users
   - ✅ Verify comment shows author name and timestamp

2. User A replies to User B's comment
   - ✅ Verify comment appears in thread
   - ✅ Verify comment count increments

3. Multiple users comment on same post
   - ✅ Verify all comments appear in chronological order
   - ✅ Verify comment count matches number of comments

### 4. Data Persistence

**Steps:**
1. User A creates a post
2. Both users refresh the page
   - ✅ Verify post still exists after refresh
   - ✅ Verify like status persists for User B
   - ✅ Verify all comments persist
   - ✅ Verify counts are accurate

### 5. Permissions and Validation

**Steps:**
1. Try to create empty post
   - ✅ Verify error message appears
   - ✅ Verify post button is disabled

2. Try to add empty comment
   - ✅ Verify error message appears
   - ✅ Verify send button is disabled

3. Logged-out user views feed
   - ✅ Verify "Sign in to see the community feed" message
   - ✅ Verify no posts are visible

### 6. Real-Time Updates

**Steps:**
1. User A creates post
   - ✅ User B sees it immediately without refresh

2. User B likes post
   - ✅ User A sees like count update immediately

3. User A comments on post
   - ✅ User B sees comment appear immediately

## Known Limitations

1. **Media Upload**: Currently only supports image URLs. Full file upload to Firebase Storage not implemented.

2. **Notifications**: No push notifications for new posts, likes, or comments.

3. **Moderation**: No admin moderation tools for deleting inappropriate posts.

4. **Edit/Delete Posts**: Users cannot edit or delete their own posts (feature not implemented).

5. **Nested Replies**: Comments are flat; no nested reply threads.

6. **Post Pagination**: Feed shows last 50 posts; no infinite scroll or pagination.

7. **Search/Filter**: No search or filter functionality for posts.

## Next Steps

1. Implement file upload for images (Firebase Storage)
2. Add notification system for likes/comments
3. Add edit/delete functionality for posts
4. Add admin moderation tools
5. Implement nested comment replies
6. Add infinite scroll/pagination
7. Add search and filter functionality
8. Add post tags and categories
9. Add post sharing functionality
10. Add user mentions (@username)

## Test Environment

- **Firebase**: Production or emulator
- **Browsers**: Chrome, Firefox, Safari
- **Devices**: Desktop, Mobile (responsive)

## Notes

- All real-time updates should work within 1-2 seconds
- Like/comment counts should be consistent across all clients
- Error messages should be user-friendly
- Loading states should be shown during async operations

