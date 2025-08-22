# Content Type Distribution Mapping System

## Overview

The Content Type Distribution Mapping System automatically maps platform selections to content types and platform categories for analytics and content classification. When users select platforms like Facebook, Instagram, or Pinterest, the system automatically:

1. **Sets the content type** as the platform name (e.g., Facebook, Instagram, Pinterest)
2. **Categorizes the platform** as "Social Media" in the platform distribution
3. **Provides analytics data** for both content type and platform category breakdowns

## 🎯 **Core Functionality**

### **Automatic Content Type Mapping**
- **Facebook** → Content Type: Facebook
- **Instagram** → Content Type: Instagram  
- **Pinterest** → Content Type: Pinterest
- **YouTube** → Content Type: YouTube
- **Spotify** → Content Type: Spotify

### **Automatic Platform Categorization**
- **Social Media Platforms** → Platform Category: social-media
- **Video Platforms** → Platform Category: video
- **Audio Platforms** → Platform Category: audio
- **Blog Platforms** → Platform Category: blog
- **Newsletter Platforms** → Platform Category: newsletter

## 🔧 **Implementation Details**

### **1. Content Type Mapping Service**

The core service (`src/services/contentTypeMapping.service.ts`) provides:

```typescript
interface ContentTypeMapping {
  platform: string;           // User-selected platform
  contentType: string;        // Content type for analytics
  platformCategory: string;   // Category for platform distribution
  analyticsLabel: string;     // Label for charts and reports
}
```

#### **Platform Mappings**
```typescript
// Social Media Platforms
{ platform: 'Facebook', contentType: 'Facebook', platformCategory: 'social-media', analyticsLabel: 'Facebook' }
{ platform: 'Instagram', contentType: 'Instagram', platformCategory: 'social-media', analyticsLabel: 'Instagram' }
{ platform: 'Pinterest', contentType: 'Pinterest', platformCategory: 'social-media', analyticsLabel: 'Pinterest' }

// Video Platforms  
{ platform: 'YouTube', contentType: 'YouTube', platformCategory: 'video', analyticsLabel: 'YouTube' }
{ platform: 'Video', contentType: 'Video', platformCategory: 'video', analyticsLabel: 'Video' }

// Audio Platforms
{ platform: 'Spotify', contentType: 'Spotify', platformCategory: 'audio', analyticsLabel: 'Spotify' }
```

### **2. Integration with Upload Components**

Both `CategorySpecificUploader.tsx` and `CategorySpecificUploader-DESKTOP-D4B599Q.tsx` now:

1. **Import the mapping service**
2. **Get content type mapping** when platform is selected
3. **Pass mapping data** to the upload result
4. **Include analytics data** in the content object

#### **Example Integration**
```typescript
// Get content type mapping for the selected platform
const selectedPlatform = selectedPlatforms[0]; // Single platform selection
const contentTypeMapping = contentTypeMappingService.getContentTypeMapping(selectedPlatform);

if (!contentTypeMapping) {
  setError(`Invalid platform: ${selectedPlatform}`);
  return;
}

// Store upload data with mapping information
setPendingUploadData({
  file: selectedFile,
  category,
  platforms: selectedPlatforms,
  formats: [],
  contentType: contentTypeMapping.contentType,           // e.g., "Facebook"
  platformCategory: contentTypeMapping.platformCategory, // e.g., "social-media"
  analyticsLabel: contentTypeMapping.analyticsLabel      // e.g., "Facebook"
});
```

### **3. Analytics Hook**

The `useContentTypeAnalytics` hook (`src/hooks/useContentTypeAnalytics.ts`) provides:

- **Real-time analytics data** based on user content
- **Automatic content type classification** from platform selections
- **Platform category breakdowns** for distribution charts
- **Color coding** for consistent visual representation

## 📊 **Analytics Data Structure**

### **Content Type Distribution (Bar Chart)**
```typescript
barData: [
  { name: 'Facebook', count: 15, views: 1250, color: '#1877F3' },
  { name: 'Instagram', count: 8, views: 890, color: '#C13584' },
  { name: 'Pinterest', count: 6, views: 450, color: '#E60023' }
]
```

### **Platform Distribution (Pie Chart)**
```typescript
platformData: [
  { name: 'Social Media', value: 29, percentage: 58, color: '#C13584' },
  { name: 'Video', value: 15, percentage: 30, color: '#FF0000' },
  { name: 'Audio', value: 6, percentage: 12, color: '#1DB954' }
]
```

### **Content Type Categories**
```typescript
socialMediaTypes: ['Facebook', 'Instagram', 'Pinterest', 'Twitter', 'TikTok', 'LinkedIn']
videoTypes: ['YouTube', 'Video', 'Vimeo']
audioTypes: ['Spotify', 'Apple Music', 'SoundCloud']
blogTypes: ['Blog', 'Medium', 'WordPress', 'Substack']
```

## 🎨 **Visual Representation**

### **Color Coding System**
- **Facebook**: #1877F3 (Facebook Blue)
- **Instagram**: #C13584 (Instagram Pink)
- **Pinterest**: #E60023 (Pinterest Red)
- **YouTube**: #FF0000 (YouTube Red)
- **Spotify**: #1DB954 (Spotify Green)

### **Category Colors**
- **Social Media**: #C13584 (Instagram Pink)
- **Video**: #FF0000 (YouTube Red)
- **Audio**: #1DB954 (Spotify Green)
- **Blog**: #FF6B35 (Blog Orange)

## 🚀 **How It Works**

### **1. User Platform Selection**
1. User uploads content and selects a platform (e.g., Facebook)
2. System validates single platform selection
3. Content type mapping service processes the selection

### **2. Automatic Mapping**
1. **Platform**: Facebook
2. **Content Type**: Facebook (for content type distribution)
3. **Platform Category**: social-media (for platform distribution)
4. **Analytics Label**: Facebook (for chart labels)

### **3. Analytics Integration**
1. Content is stored with mapping data
2. Analytics hook processes the data
3. Charts automatically update with new classifications
4. Platform distribution shows "Social Media" category

## 📱 **Supported Platforms**

### **Social Media Platforms**
- Facebook, Instagram, Pinterest, Twitter, TikTok, LinkedIn

### **Video Platforms**
- YouTube, Video, Vimeo

### **Audio Platforms**
- Spotify, Apple Music, SoundCloud

### **Blog Platforms**
- Blog, Medium, WordPress, Substack

### **Newsletter Platforms**
- Newsletter, Mailchimp

### **Other Platforms**
- Other (fallback category)

## 🔍 **Testing the System**

### **Demo Component**
Use `ContentTypeMappingDemo.tsx` to test:

1. **Platform Selection**: Click different platforms to see mapping
2. **Real-time Mapping**: View content type and category assignments
3. **Analytics Display**: See how data flows to charts
4. **Category Breakdown**: Verify platform distribution grouping

### **Test Scenarios**
1. **Select Facebook** → Should show Content Type: Facebook, Category: social-media
2. **Select Instagram** → Should show Content Type: Instagram, Category: social-media
3. **Select Pinterest** → Should show Content Type: Pinterest, Category: social-media
4. **Upload Content** → Should appear in both content type and platform distribution charts

## 🎯 **Benefits**

### **For Users**
- **Simplified Selection**: Only need to choose platform, not content type
- **Consistent Experience**: Same platform always maps to same content type
- **Clear Analytics**: See exactly where content is distributed

### **For Analytics**
- **Automatic Classification**: No manual content type assignment needed
- **Accurate Grouping**: Social media platforms properly grouped together
- **Real-time Updates**: Analytics reflect platform selections immediately

### **For Development**
- **Centralized Mapping**: All platform mappings in one service
- **Easy Extension**: Simple to add new platforms and categories
- **Type Safety**: Full TypeScript support with interfaces

## 🔮 **Future Enhancements**

### **Potential Improvements**
- **Smart Defaults**: Suggest optimal platforms based on content type
- **Platform Recommendations**: AI-powered platform suggestions
- **Custom Categories**: User-defined platform groupings
- **Analytics Insights**: Performance comparisons across platforms

### **Extensibility**
- **New Platforms**: Easy to add new social media platforms
- **Category Expansion**: Support for new platform categories
- **Custom Mappings**: User-specific platform classifications
- **Integration APIs**: Connect with external platform analytics

## 📚 **Related Files**

- `src/services/contentTypeMapping.service.ts` - Core mapping service
- `src/hooks/useContentTypeAnalytics.ts` - Analytics integration hook
- `src/components/analytics/ContentTypeMappingDemo.tsx` - Demo component
- `src/components/content/CategorySpecificUploader.tsx` - Main upload component
- `src/components/content/CategorySpecificUploader-DESKTOP-D4B599Q.tsx` - Desktop upload component

## 🎉 **Summary**

The Content Type Distribution Mapping System provides automatic, intelligent content classification based on platform selection. When users choose platforms like Facebook, Instagram, or Pinterest, the system automatically:

- ✅ **Sets content type** to match the platform name
- ✅ **Categorizes platform** as "Social Media" 
- ✅ **Updates analytics** in real-time
- ✅ **Maintains consistency** across all uploads
- ✅ **Simplifies user experience** with single platform selection

This system ensures that all social media content is properly grouped together in analytics while maintaining individual platform identification for detailed reporting.
