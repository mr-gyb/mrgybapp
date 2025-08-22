# Default Content Feature for mrgybapp

## Overview

This feature provides default/sample content for new users who haven't uploaded any content yet. It helps users understand what the platform can do and provides a better onboarding experience.

## Implementation Details

### 1. Default Content Data

**File:** `src/types/content.ts`

- `DEFAULT_CONTENT_ITEMS`: Array of sample content items showing different content types
- `DEFAULT_CONTENT_DERIVATIVES`: Sample AI-generated derivatives for content analysis

### 2. Enhanced ContentList Component

**File:** `src/components/content/ContentList.tsx`

**New Props:**
- `showDefaults?: boolean` - Controls whether to show default content (default: true)
- `onUploadClick?: () => void` - Callback for upload button clicks

**Features:**
- Displays default content when no user content is available
- Shows "Sample" badges on default content items
- Provides empty state with upload button when no content and defaults disabled
- Welcome banner explaining the sample content

### 3. Content Utilities

**File:** `src/utils/contentUtils.ts`

**Functions:**
- `hasRealContent()` - Check if user has real content
- `filterRealContent()` - Filter out default content items
- `getDisplayContent()` - Get content to display (real or defaults)
- `isDefaultContent()` - Check if item is default content
- `getContentStats()` - Get content statistics
- `getContentSuggestions()` - Get personalized content suggestions

### 4. Content Suggestions Component

**File:** `src/components/content/ContentSuggestions.tsx`

- Shows helpful suggestions for new users
- Provides content type recommendations
- Includes upload button for quick access
- Only shows when user has no real content

### 5. Updated GYBStudio

**File:** `src/components/GYBStudio.tsx`

- Integrates ContentList with default content
- Includes ContentSuggestions component
- Provides upload navigation

## Usage Examples

### Basic ContentList Usage

```tsx
// Show default content when empty
<ContentList 
  items={userContent}
  onItemClick={handleContentClick}
  showDefaults={true}
  onUploadClick={handleUpload}
/>

// Don't show defaults, just empty state
<ContentList 
  items={userContent}
  onItemClick={handleContentClick}
  showDefaults={false}
  onUploadClick={handleUpload}
/>
```

### Content Utilities Usage

```tsx
import { hasRealContent, getContentStats, getContentSuggestions } from '../utils/contentUtils';

// Check if user has real content
const hasContent = hasRealContent(userContent);

// Get content statistics
const stats = getContentStats(userContent);
console.log(`Total content: ${stats.total}`);
console.log(`By type:`, stats.byType);

// Get suggestions
const suggestions = getContentSuggestions(userContent);
```

### Content Suggestions Usage

```tsx
<ContentSuggestions 
  userContent={userContent}
  onUploadClick={() => navigate('/upload')}
/>
```

## Default Content Items

The system provides 4 sample content items:

1. **Welcome to GYB Studio** (Written)
   - Introduction content
   - Blog and headline derivatives
   - Blog and social platforms

2. **Sample Video Content** (Video)
   - Video analysis example
   - YouTube, Instagram, TikTok platforms
   - Video thumbnail

3. **Sample Image Content** (Photo)
   - Image optimization example
   - Instagram, Pinterest, Facebook platforms
   - Sample image URL

4. **Sample Audio Content** (Audio)
   - Podcast content example
   - Spotify, Apple Podcasts, YouTube platforms

## Customization

### Adding More Default Content

Edit `DEFAULT_CONTENT_ITEMS` in `src/types/content.ts`:

```tsx
export const DEFAULT_CONTENT_ITEMS: ContentItem[] = [
  // ... existing items
  {
    id: 'default-5',
    title: 'Your New Sample Content',
    description: 'Description here',
    type: 'written',
    status: 'pending',
    createdAt: new Date().toISOString(),
    // ... other properties
  }
];
```

### Modifying Default Derivatives

Edit `DEFAULT_CONTENT_DERIVATIVES` in `src/types/content.ts`:

```tsx
export const DEFAULT_CONTENT_DERIVATIVES: ContentDerivative[] = [
  // ... existing derivatives
  {
    id: 'derivative-5',
    derivative_type: 'blog',
    content: 'Your custom blog content',
    created_at: new Date().toISOString()
  }
];
```

### Customizing Suggestions

Modify `getContentSuggestions()` in `src/utils/contentUtils.ts`:

```tsx
export const getContentSuggestions = (items: ContentItem[]): string[] => {
  // Add your custom suggestions here
  const customSuggestions = [
    'Your custom suggestion here',
    'Another helpful tip'
  ];
  
  return [...existingSuggestions, ...customSuggestions];
};
```

## Benefits

1. **Better Onboarding** - New users see what's possible
2. **Reduced Empty States** - No blank screens for new users
3. **Educational** - Shows different content types and features
4. **Actionable** - Provides clear next steps with upload buttons
5. **Professional** - Makes the app feel more complete

## Future Enhancements

- Dynamic default content based on user preferences
- Interactive tutorials using default content
- A/B testing different default content sets
- Personalized suggestions based on user industry/niche 