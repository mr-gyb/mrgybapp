# Dynamic View Count Updates

## Problem
The view count was not dynamically updating based on YouTube videos when another video was uploaded or deleted from the Content Hub.

## Solution
Implemented a comprehensive real-time view count tracking system that automatically updates when content is added, modified, or removed from the Content Hub.

## Changes Made

### 1. Enhanced Dashboard Component (`src/components/Dashboard.tsx`)
- Added real-time Firestore listener for content changes
- Implemented automatic view count updates when content changes
- Added proper error handling and loading states
- Integrated with the content performance tracking system

### 2. Enhanced useUserContent Hook (`src/hooks/useUserContent.ts`)
- Added real-time Firestore listener for user-specific content
- Implemented automatic content refresh when changes are detected
- Added proper error handling for content changes

### 3. Enhanced useContentPerformance Hook (`src/hooks/useContentPerformance.ts`)
- Added automatic performance updates when content changes
- Implemented debounced updates to prevent excessive API calls
- Added integration with user content to trigger updates

### 4. Enhanced Content Performance Service (`src/services/contentPerformance.service.ts`)
- Added real-time content change listeners
- Implemented automatic performance updates for new/modified content
- Added cleanup for deleted content
- Enhanced error handling and logging

### 5. Created ViewCountDisplay Component (`src/components/ViewCountDisplay.tsx`)
- New component that displays real-time view counts
- Shows total views across all platforms
- Provides manual refresh functionality
- Displays tracking status and content statistics

## How It Works

### Real-Time Updates
1. **Content Change Detection**: The system listens to Firestore changes in the `media_content` collection
2. **Automatic Performance Updates**: When content is added, modified, or removed, the system automatically fetches updated view counts from platform APIs
3. **Debounced Updates**: Updates are debounced to prevent excessive API calls when multiple changes occur quickly

### View Count Tracking
1. **Platform API Integration**: The system fetches view counts from YouTube, Instagram, Facebook, and other platforms
2. **Performance Data Storage**: View counts are stored in the `content_performance` collection in Firestore
3. **Real-Time Display**: The ViewCountDisplay component shows live view counts that update automatically

### Content Management
1. **Upload**: When new content is uploaded, the system automatically detects it and fetches view counts
2. **Modification**: When content is modified, view counts are updated
3. **Deletion**: When content is deleted, performance data is cleaned up

## Usage

### Automatic Updates
The system automatically starts tracking when the Dashboard component loads. View counts will update:
- Every 5 minutes automatically
- When content is uploaded or deleted
- When the user manually refreshes

### Manual Updates
Users can manually refresh view counts by clicking the "Refresh" button in the ViewCountDisplay component.

### Configuration
The tracking interval can be configured in the `useContentPerformance` hook:
```typescript
startTracking(5); // Update every 5 minutes
```

## API Requirements

### YouTube API
- Requires `VITE_YOUTUBE_API_KEY` environment variable
- Fetches view counts, likes, and comments

### Other Platforms
- Instagram, Facebook, TikTok, Pinterest, and Spotify APIs are supported
- Each platform requires appropriate API keys and access tokens

## Error Handling
- Network errors are handled gracefully
- Failed API calls are logged but don't break the system
- Users are notified of errors through the UI
- Retry mechanisms are implemented for failed updates

## Performance Considerations
- Updates are debounced to prevent excessive API calls
- Real-time listeners are properly cleaned up to prevent memory leaks
- Local storage is used to cache content data
- API rate limits are respected

## Testing
To test the dynamic updates:
1. Upload a new YouTube video to the Content Hub
2. Watch the view count update automatically
3. Delete content and verify the counts update
4. Check that the ViewCountDisplay component shows real-time data

## Future Enhancements
- Add support for more platforms
- Implement more detailed analytics
- Add export functionality for performance data
- Implement webhook support for real-time platform updates
