# How to Deploy Firebase Storage Rules

## Issue
If you're getting `storage/unauthorized` errors when trying to access community post images, the storage rules need to be deployed to Firebase.

## Solution: Deploy via Firebase Console

Since Firebase CLI is not installed, deploy the rules via the Firebase Console:

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `mr-gyb-ai-app-108` (or your project name)
3. Navigate to **Storage** → **Rules** tab

### Step 2: Copy Rules
Copy the entire contents of `storage.rules` file:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images - users can read/write their own
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Cover images - users can read/write their own
    match /cover-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Community posts - allow public read, authenticated upload
    match /community-posts/{fileName} {
      // Allow public read access for community post images
      // This ensures images are visible to all users (including unauthenticated)
      allow read: if true;
      // Only authenticated users can upload images
      allow write: if request.auth != null;
    }
    
    // Media content - allow authenticated users to read, upload their own
    match /media-content/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // User uploads folder - users can read/write their own
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Content folder - allow authenticated users to read, write their own
    match /content/{docId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 3: Paste and Publish
1. Paste the rules into the Firebase Console Rules editor
2. Click **Publish** button
3. Wait for confirmation that rules are deployed

### Step 4: Test
After deployment, try accessing a community post image again. The error should be resolved.

## Alternative: Install Firebase CLI

If you prefer using CLI:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy storage rules
firebase deploy --only storage
```

## Rules Summary

- **Community Posts**: Public read access (`allow read: if true`) - anyone can view images
- **Uploads**: Only authenticated users can upload (`allow write: if request.auth != null`)
- **Profile/Cover Images**: Authenticated users can read, owners can write
- **Media Content**: Authenticated users can read/write

## Security Note

The community posts rules allow **public read access** for simplicity. In production, you might want to restrict read access to authenticated users only:

```javascript
allow read: if request.auth != null;
```

This would require users to be signed in to view community post images.

