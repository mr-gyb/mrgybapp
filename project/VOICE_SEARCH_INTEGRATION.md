# Voice Search Integration Guide

## Overview
This guide explains how to integrate the VoiceSearch component into your chat application for voice-to-text functionality.

## Files Created
- `src/components/VoiceSearch.tsx` - Main voice search component
- `src/components/VoiceSearch.css` - Styling for the component
- `src/utils/whisperApi.ts` - OpenAI Whisper API helper functions

## Environment Setup

### 1. Add OpenAI API Key
Add your OpenAI API key to your `.env.local` file:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your environment variables

## Integration Steps

### 1. Import the Component
The VoiceSearch component is already imported in `GYBTeamChat.tsx`:
```typescript
import VoiceSearch from "./VoiceSearch";
```

### 2. Add Handler Function
The voice transcription handler is already added:
```typescript
const handleVoiceTranscription = (transcribedText: string) => {
  setMessage(transcribedText);
  // Optionally auto-send the message
};
```

### 3. Replace Mic Button
The mic button has been replaced with the VoiceSearch component:
```typescript
<VoiceSearch
  onTranscriptionComplete={handleVoiceTranscription}
  disabled={!selectedChat}
  className="voice-search-integration"
/>
```

## How It Works

### 1. User Flow
1. User clicks the mic button
2. Browser requests microphone permission
3. Audio recording starts
4. User speaks their message
5. User clicks stop or recording auto-stops
6. Audio is sent to Whisper API (or browser SpeechRecognition)
7. Transcribed text appears in the input field
8. User can edit and send the message

### 2. Fallback System
- **Primary**: OpenAI Whisper API (if API key is available)
- **Fallback**: Browser SpeechRecognition API (if Whisper unavailable)
- **Error Handling**: Graceful degradation with user feedback

### 3. Browser Compatibility
- **Modern Browsers**: Full support with MediaRecorder and SpeechRecognition
- **Older Browsers**: Graceful fallback to SpeechRecognition only
- **Mobile**: Works on mobile browsers with microphone access

## Testing Locally

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Voice Search
1. Navigate to the chat interface
2. Click the mic button
3. Allow microphone permissions when prompted
4. Speak your message
5. Click stop or wait for auto-stop
6. Verify transcribed text appears in input field

### 3. Test Different Scenarios
- **With OpenAI API**: Set `VITE_OPENAI_API_KEY` in `.env.local`
- **Without OpenAI API**: Remove the API key to test browser fallback
- **Permission Denied**: Test error handling
- **No Microphone**: Test graceful degradation

## Configuration Options

### VoiceSearch Props
```typescript
interface VoiceSearchProps {
  onTranscriptionComplete: (text: string) => void; // Required
  isRecording?: boolean; // Optional
  disabled?: boolean; // Optional
  className?: string; // Optional
}
```

### Whisper API Options
```typescript
const options = {
  model: 'whisper-1', // Default model
  language: 'en', // Language code
  prompt: '', // Optional prompt
  responseFormat: 'json', // Response format
  temperature: 0 // Temperature for randomness
};
```

## Error Handling

### Common Errors
1. **Microphone Permission Denied**
   - Error: "Microphone permission is required for voice search"
   - Solution: Allow microphone access in browser settings

2. **OpenAI API Key Missing**
   - Error: "OpenAI API key not found"
   - Solution: Add `VITE_OPENAI_API_KEY` to environment variables

3. **Audio Format Unsupported**
   - Error: "Unsupported audio format"
   - Solution: Browser compatibility issue, try different browser

4. **Network Error**
   - Error: "Failed to transcribe audio"
   - Solution: Check internet connection and API key validity

### Debugging
1. Check browser console for error messages
2. Verify environment variables are loaded
3. Test microphone permissions manually
4. Check OpenAI API key validity

## Production Deployment

### 1. Environment Variables
Ensure all environment variables are set in your production environment:
```bash
VITE_OPENAI_API_KEY=your_production_api_key
```

### 2. HTTPS Requirement
Voice search requires HTTPS in production:
- Ensure your production site uses HTTPS
- Microphone access is blocked on HTTP sites

### 3. API Rate Limits
- OpenAI has rate limits for API calls
- Monitor usage to avoid hitting limits
- Consider implementing retry logic for rate limit errors

## Customization

### Styling
Modify `VoiceSearch.css` to customize:
- Button colors and animations
- Status indicator styling
- Responsive design
- Accessibility features

### Functionality
Extend the component by:
- Adding custom error messages
- Implementing retry logic
- Adding audio visualization
- Supporting multiple languages

## Troubleshooting

### Common Issues
1. **Component not rendering**: Check import path
2. **Styling not applied**: Verify CSS import
3. **API errors**: Check API key and network
4. **Permission errors**: Check browser settings
5. **Audio not recording**: Check microphone hardware

### Support
- Check browser console for detailed error messages
- Verify all dependencies are installed
- Test in different browsers
- Check microphone hardware functionality

## Performance Considerations

### Optimization Tips
1. **Audio Quality**: Use appropriate sample rates
2. **File Size**: Compress audio before sending to API
3. **Caching**: Cache API responses when possible
4. **Error Recovery**: Implement retry mechanisms
5. **User Feedback**: Provide clear status indicators

### Best Practices
1. **Permission Handling**: Always check permissions before recording
2. **Error Messages**: Provide clear, actionable error messages
3. **Fallback Support**: Always have a fallback option
4. **User Experience**: Make the interface intuitive
5. **Accessibility**: Ensure keyboard navigation works
