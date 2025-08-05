# Database Structure for GYB Studio Content Management

## Overview
This document outlines the database structure for the GYB Studio content management system using Firebase Firestore with the collection `/new_content/<docID>`.

## Main Collection: `new_content`

### Document Structure
```typescript
interface ContentDocument {
  // Core identification
  id: string;                    // Auto-generated Firestore document ID
  userId: string;                // User who created/uploaded the content
  title: string;                 // Content title (filename or custom title)
  description?: string;          // Optional description
  
  // Content classification
  contentType: 'image' | 'video' | 'audio' | 'document' | 'link' | 'blog';
  category?: string;             // Optional category (e.g., 'social', 'business', 'personal')
  
  // Status and processing
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'draft' | 'published';
  processingProgress?: number;   // 0-100 for processing status
  
  // File storage (for uploaded files)
  fileUrl?: string;              // Public download URL from Firebase Storage
  originalUrl?: string;          // Original file URL or external link
  storagePath?: string;          // Firebase Storage path
  thumbnailUrl?: string;         // Thumbnail/preview image URL
  
  // Content metadata
  metadata: {
    // File-specific metadata
    size?: number;               // File size in bytes
    mimeType?: string;           // MIME type (e.g., "image/jpeg")
    originalName?: string;       // Original filename
    dimensions?: {               // For images/videos
      width?: number;
      height?: number;
    };
    duration?: number;           // For audio/video (in seconds)
    
    // User selections
    platforms: string[];         // ['instagram', 'pinterest', 'facebook']
    formats: string[];           // ['story', 'post', 'reel', 'carousel']
    
    // AI processing results
    aiAnalysis?: {
      tags?: string[];
      sentiment?: string;
      language?: string;
      confidence?: number;
    };
    
    // Upload tracking
    uploadTimestamp: number;     // Timestamp when uploaded
    uploadMethod: 'file' | 'url'; // How content was added
    
    // Custom fields
    tags?: string[];
    customFields?: Record<string, any>;
  };
  
  // Analytics and engagement
  analytics: {
    views: number;
    shares: number;
    likes: number;
    downloads: number;
    lastViewed?: string;         // ISO timestamp
  };
  
  // Relationships
  parentContentId?: string;      // For content derived from other content
  relatedContentIds?: string[];  // Related content references
  
  // Timestamps
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  publishedAt?: string;          // ISO timestamp when published
}
```

## Content Type Organization

### 1. Image Uploads (`contentType: 'image'`)
```json
{
  "id": "content_abc123",
  "userId": "xgXwCwXswHVX9z8iDxVcfTRz40p2",
  "title": "Product Photo",
  "description": "High-quality product image for social media",
  "contentType": "image",
  "category": "social",
  "status": "completed",
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/uploads%2FxgXwCwXswHVX9z8iDxVcfTRz40p2%2F1712345678901.jpg",
  "originalUrl": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/uploads%2FxgXwCwXswHVX9z8iDxVcfTRz40p2%2F1712345678901.jpg",
  "storagePath": "uploads/xgXwCwXswHVX9z8iDxVcfTRz40p2/1712345678901.jpg",
  "metadata": {
    "size": 2048576,
    "mimeType": "image/jpeg",
    "originalName": "product-photo.jpg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "platforms": ["instagram", "pinterest", "facebook"],
    "formats": ["post", "story", "carousel"],
    "uploadTimestamp": 1712345678901,
    "uploadMethod": "file",
    "tags": ["product", "marketing", "social-media"]
  },
  "analytics": {
    "views": 0,
    "shares": 0,
    "likes": 0,
    "downloads": 0
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Video Uploads (`contentType: 'video'`)
```json
{
  "id": "content_def456",
  "userId": "xgXwCwXswHVX9z8iDxVcfTRz40p2",
  "title": "Product Demo Video",
  "description": "Demonstration of our new product features",
  "contentType": "video",
  "category": "marketing",
  "status": "processing",
  "processingProgress": 75,
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/uploads%2FxgXwCwXswHVX9z8iDxVcfTRz40p2%2F1712345678902.mp4",
  "storagePath": "uploads/xgXwCwXswHVX9z8iDxVcfTRz40p2/1712345678902.mp4",
  "metadata": {
    "size": 52428800,
    "mimeType": "video/mp4",
    "originalName": "demo-video.mp4",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "duration": 120,
    "platforms": ["youtube", "instagram", "tiktok"],
    "formats": ["reel", "story", "post"],
    "uploadTimestamp": 1712345678902,
    "uploadMethod": "file"
  },
  "analytics": {
    "views": 0,
    "shares": 0,
    "likes": 0,
    "downloads": 0
  },
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:15:00.000Z"
}
```

### 3. Audio Uploads (`contentType: 'audio'`)
```json
{
  "id": "content_ghi789",
  "userId": "xgXwCwXswHVX9z8iDxVcfTRz40p2",
  "title": "Podcast Episode",
  "description": "Weekly podcast episode about industry trends",
  "contentType": "audio",
  "category": "podcast",
  "status": "completed",
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/uploads%2FxgXwCwXswHVX9z8iDxVcfTRz40p2%2F1712345678903.mp3",
  "storagePath": "uploads/xgXwCwXswHVX9z8iDxVcfTRz40p2/1712345678903.mp3",
  "metadata": {
    "size": 15728640,
    "mimeType": "audio/mpeg",
    "originalName": "podcast-episode.mp3",
    "duration": 1800,
    "platforms": ["spotify", "apple-podcasts", "youtube"],
    "formats": ["podcast", "audio"],
    "uploadTimestamp": 1712345678903,
    "uploadMethod": "file"
  },
  "analytics": {
    "views": 0,
    "shares": 0,
    "likes": 0,
    "downloads": 0
  },
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

### 4. Document Uploads (`contentType: 'document'`)
```json
{
  "id": "content_jkl012",
  "userId": "xgXwCwXswHVX9z8iDxVcfTRz40p2",
  "title": "Business Plan",
  "description": "Comprehensive business plan document",
  "contentType": "document",
  "category": "business",
  "status": "completed",
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/uploads%2FxgXwCwXswHVX9z8iDxVcfTRz40p2%2F1712345678904.pdf",
  "storagePath": "uploads/xgXwCwXswHVX9z8iDxVcfTRz40p2/1712345678904.pdf",
  "metadata": {
    "size": 1048576,
    "mimeType": "application/pdf",
    "originalName": "business-plan.pdf",
    "platforms": ["linkedin", "blog", "social"],
    "formats": ["document", "article"],
    "uploadTimestamp": 1712345678904,
    "uploadMethod": "file"
  },
  "analytics": {
    "views": 0,
    "shares": 0,
    "likes": 0,
    "downloads": 0
  },
  "createdAt": "2024-01-15T13:00:00.000Z",
  "updatedAt": "2024-01-15T13:00:00.000Z"
}
```

### 5. Link/URL Content (`contentType: 'link'`)
```json
{
  "id": "content_mno345",
  "userId": "xgXwCwXswHVX9z8iDxVcfTRz40p2",
  "title": "Competitor Analysis Article",
  "description": "Analysis of competitor strategies in our market",
  "contentType": "link",
  "category": "research",
  "status": "completed",
  "originalUrl": "https://example.com/competitor-analysis",
  "storagePath": "",
  "metadata": {
    "sourceUrl": "https://example.com/competitor-analysis",
    "platforms": ["linkedin", "blog", "social"],
    "formats": ["article", "post"],
    "uploadTimestamp": 1712345678905,
    "uploadMethod": "url"
  },
  "analytics": {
    "views": 5,
    "shares": 2,
    "likes": 1,
    "downloads": 0
  },
  "createdAt": "2024-01-15T14:00:00.000Z",
  "updatedAt": "2024-01-15T14:00:00.000Z"
}
```

## Firebase Storage Structure

```
your-project.appspot.com/
├── uploads/
│   └── xgXwCwXswHVX9z8iDxVcfTRz40p2/
│       ├── 1712345678901.jpg    # Image upload
│       ├── 1712345678902.mp4    # Video upload
│       ├── 1712345678903.mp3    # Audio upload
│       └── 1712345678904.pdf    # Document upload
└── content/
    └── [docID]/
        ├── original/            # Original files
        ├── thumbnails/          # Generated thumbnails
        └── derivatives/         # AI-generated content
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // New content collection rules
    match /new_content/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Media derivatives rules
    match /media_derivatives/{document} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/new_content/$(resource.data.mediaId)) &&
        get(/databases/$(database)/documents/new_content/$(resource.data.mediaId)).data.userId == request.auth.uid;
    }
  }
}
```

## Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to upload to their own folder
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to access content in their own folder
    match /content/{docId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/new_content/$(docId)) &&
        get(/databases/$(database)/documents/new_content/$(docId)).data.userId == request.auth.uid;
    }
  }
}
```

## Query Examples

### Get all content for a user
```typescript
const userContent = await getDocs(
  query(
    collection(db, 'new_content'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
);
```

### Get content by type
```typescript
const imageContent = await getDocs(
  query(
    collection(db, 'new_content'),
    where('userId', '==', userId),
    where('contentType', '==', 'image'),
    orderBy('createdAt', 'desc')
  )
);
```

### Get content by status
```typescript
const pendingContent = await getDocs(
  query(
    collection(db, 'new_content'),
    where('userId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  )
);
```

### Get content by platform
```typescript
// Note: This requires array-contains queries
const instagramContent = await getDocs(
  query(
    collection(db, 'new_content'),
    where('userId', '==', userId),
    where('metadata.platforms', 'array-contains', 'instagram'),
    orderBy('createdAt', 'desc')
  )
);
```

## Error Tracking

The system includes comprehensive console logging for tracking upload errors:

- 🚀 Upload process start
- 📋 Content type determination
- 📁 Storage path generation
- ⬆️ Firebase Storage upload
- 🔗 Public URL generation
- 💾 Database save
- 🔄 Content processing
- ✅ Success confirmations
- ❌ Detailed error logging

All errors include:
- Error message and stack trace
- File information (name, size, type)
- User ID
- Content type
- Timestamp
- Processing stage

This structure ensures all content types are properly organized and trackable while maintaining a unified database schema. 