# User Content Upload and Display Feature

## Overview

This feature allows users to upload content and see it displayed in their content history in GYB Studio. When users upload content, it's saved to the database and immediately appears in their content history.

## Implementation Details

### 1. User Content Service

**File:** `src/services/userContent.service.ts`

**Key Functions:**
- `getUserContent(userId)` - Fetch user's uploaded content from database
- `convertToContentItem(data)` - Convert database data to ContentItem format
- `addUserContent()`, `updateUserContent()`, `removeUserContent()` - Content management

**Database Integration:**
- Reads from `media_content` collection in Firestore
- Maps database fields to ContentItem interface
- Handles content type mapping and platform assignment

### 2. User Content Hook

**File:** `src/hooks/useUserContent.ts`

**Features:**
- Manages content state, loading, and error handling
- Provides content statistics and real content detection
- Handles content operations (add, update, remove, refresh)
- Automatic content loading on user authentication

**Usage:**
```tsx
const { 
  content, 
  isLoading, 
  addContent, 
  refreshContent,
  hasRealContent,
  contentStats 
} = useUserContent();
```

### 3. Updated GYBStudio Component

**File:** `src/components/GYBStudio.tsx`

**New Features:**
- Loads user content from database on mount
- Handles uploaded content from navigation state
- Displays real user content alongside default content
- Content count display
- Refresh functionality

**Upload Flow:**
1. User uploads content via ContentUpload component
2. Upload result passed to GYBStudio via navigation state
3. GYBStudio creates ContentItem and adds to content list
4. Content appears immediately in content history

### 4. Enhanced ContentUpload Component

**File:** `src/components/ContentUpload.tsx`

**Updates:**
- Enhanced upload result data structure
- Proper navigation to GYBStudio with upload data
- Better error handling and user feedback

## Upload Flow

### Step 1: User Uploads Content
```tsx
// User selects file or enters URL
const handleUpload = async (result) => {
  const uploadData = {
    id: result.id,
    url: result.url,
    type: result.type,
    uploadedAt: new Date().toISOString(),
    status: 'uploaded'
  };
  
  navigate('/gyb-studio', { 
    state: { uploadedContent: uploadData } 
  });
};
```

### Step 2: Content Saved to Database
```tsx
// In media.service.ts
export const uploadMedia = async (file: File, userId: string) => {
  // Upload to Firebase Storage
  const storageRef = ref(storage, `media-content/${fileName}`);
  await uploadBytes(storageRef, file);
  const publicUrl = await getDownloadURL(storageRef);
  
  // Save to Firestore
  const mediaData = {
    userId,
    contentType: file.type.split('/')[0],
    storagePath: fileName,
    originalUrl: publicUrl,
    metadata: { size: file.size, type: file.type, name: file.name },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const mediaRef = await addDoc(collection(db, 'media_content'), mediaData);
  
  return {
    id: mediaRef.id,
    url: publicUrl,
    type: file.type.split('/')[0]
  };
};
```

### Step 3: Content Displayed in GYBStudio
```tsx
// In GYBStudio.tsx
useEffect(() => {
  const uploadedContent = location.state?.uploadedContent;
  if (uploadedContent) {
    handleNewUpload(uploadedContent);
    navigate(location.pathname, { replace: true });
  }
}, [location.state]);

const handleNewUpload = (uploadResult) => {
  const newContent: ContentItem = {
    id: uploadResult.id,
    title: `Uploaded ${uploadResult.type}`,
    description: `Your uploaded ${uploadResult.type} content`,
    type: mapUploadTypeToContentType(uploadResult.type),
    status: 'pending',
    createdAt: new Date().toISOString(),
    originalUrl: uploadResult.url,
    thumbnail: uploadResult.url,
    // ... other properties
  };
  
  addContent(newContent);
};
```

## Content Types and Mapping

### Database to ContentItem Mapping
```tsx
const mapContentType = (dbType: string): ContentType => {
  switch (dbType.toLowerCase()) {
    case 'video': return 'video';
    case 'image': return 'photo';
    case 'audio': return 'audio';
    case 'document':
    case 'text': return 'written';
    case 'link': return 'written';
    default: return 'written';
  }
};
```

### Default Platforms by Content Type
```tsx
const getDefaultPlatforms = (contentType: ContentType): string[] => {
  switch (contentType) {
    case 'video': return ['youtube', 'instagram', 'tiktok'];
    case 'photo': return ['instagram', 'pinterest', 'facebook'];
    case 'audio': return ['spotify', 'apple-podcasts', 'youtube'];
    case 'written': return ['blog', 'social', 'linkedin'];
    default: return ['social'];
  }
};
```

## Database Schema

### media_content Collection
```typescript
interface UserContentData {
  id: string;
  userId: string;
  title: string | null;
  description: string | null;
  contentType: string;
  originalUrl: string | null;
  storagePath: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### ContentItem Interface
```typescript
interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: string;
  createdAt: string;
  originalUrl?: string;
  thumbnail?: string;
  generatedAssets?: Array<{
    id: string;
    type: string;
    status: string;
    content: string;
  }>;
  platforms?: string[];
}
```

## Features

### 1. Real-time Content Display
- Content appears immediately after upload
- No page refresh required
- Seamless integration with existing UI

### 2. Content Statistics
- Total content count
- Content by type
- Content by status
- Real vs default content detection

### 3. Content Management
- Add new content
- Update existing content
- Remove content
- Refresh content list

### 4. Error Handling
- Loading states
- Error messages
- Graceful fallbacks

### 5. User Experience
- Default content for new users
- Real content takes priority
- Clear content count display
- Refresh functionality

## Usage Examples

### Basic Content Loading
```tsx
const { content, isLoading, error } = useUserContent();

if (isLoading) return <div>Loading content...</div>;
if (error) return <div>Error: {error}</div>;

return <ContentList items={content} />;
```

### Adding New Content
```tsx
const { addContent } = useUserContent();

const handleUpload = (uploadResult) => {
  const newContent = createContentItem(uploadResult);
  addContent(newContent);
};
```

### Content Statistics
```tsx
const { contentStats, hasRealContent } = useUserContent();

console.log(`Total content: ${contentStats.total}`);
console.log(`Real content: ${contentStats.realContent}`);
console.log(`Has real content: ${hasRealContent}`);
```

## Benefits

1. **Immediate Feedback** - Users see their content right after upload
2. **Persistent Storage** - Content saved to database for future access
3. **Type Safety** - Full TypeScript support with proper interfaces
4. **Scalable** - Hook-based architecture for reusability
5. **User-Friendly** - Clear content count and status indicators
6. **Error Resilient** - Proper error handling and loading states

## Future Enhancements

- Content editing capabilities
- Content status updates (pending → processing → completed)
- Content analytics and performance tracking
- Content sharing and collaboration
- Advanced content filtering and search
- Content versioning and history 