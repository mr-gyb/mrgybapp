// Voice Chat Feature Test Script
// Run this in the browser console to test voice functionality

console.log('🎤 Starting Voice Chat Feature Test...');

// Test function to check SpeechRecognition support
function testSpeechRecognitionSupport() {
  console.log('\n🔍 Testing SpeechRecognition Support...');
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    console.log('✅ SpeechRecognition is supported');
    console.log('Available languages:', navigator.languages);
    
    // Test creating a recognition instance
    try {
      const recognition = new SpeechRecognition();
      console.log('✅ SpeechRecognition instance created successfully');
      console.log('Recognition properties:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      });
    } catch (error) {
      console.error('❌ Error creating SpeechRecognition instance:', error);
    }
  } else {
    console.error('❌ SpeechRecognition is not supported in this browser');
    console.log('💡 Try using Chrome, Edge, or Safari for best support');
  }
}

// Test function to check microphone permissions
async function testMicrophonePermissions() {
  console.log('\n🎙️ Testing Microphone Permissions...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone access granted');
    console.log('Audio tracks:', stream.getAudioTracks().length);
    
    // Stop the stream
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Microphone stream stopped');
  } catch (error: any) {
    console.error('❌ Microphone access denied or not available:', error.message);
    
    if (error.name === 'NotAllowedError') {
      console.log('💡 Please allow microphone access in your browser settings');
    } else if (error.name === 'NotFoundError') {
      console.log('💡 No microphone found on this device');
    }
  }
}

// Test function to check Whisper API availability
function testWhisperAPI() {
  console.log('\n🤖 Testing Whisper API Availability...');
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (apiKey) {
    console.log('✅ OpenAI API key found');
    console.log('💡 Whisper API integration is available');
  } else {
    console.log('⚠️ OpenAI API key not found');
    console.log('💡 Add VITE_OPENAI_API_KEY to your .env file to enable Whisper API');
  }
}

// Test function to simulate voice input
function testVoiceInputComponent() {
  console.log('\n🎯 Testing Voice Input Component...');
  
  // Check if VoiceInput component is available
  const voiceInputElements = document.querySelectorAll('.voice-input-container, .voice-input-minimal, .chat-room-voice-input');
  
  if (voiceInputElements.length > 0) {
    console.log(`✅ Found ${voiceInputElements.length} VoiceInput components in the DOM`);
    
    voiceInputElements.forEach((element, index) => {
      console.log(`VoiceInput ${index + 1}:`, {
        className: element.className,
        hasMicButton: !!element.querySelector('button'),
        hasInput: !!element.querySelector('input'),
        hasForm: !!element.querySelector('form')
      });
    });
  } else {
    console.log('⚠️ No VoiceInput components found in the DOM');
    console.log('💡 Make sure you are on a page with chat functionality');
  }
}

// Test function to check React components
function testReactComponents() {
  console.log('\n⚛️ Testing React Components...');
  
  // Check if React is available
  if (typeof React !== 'undefined') {
    console.log('✅ React is available');
  } else {
    console.log('❌ React is not available');
  }
  
  // Check if our hooks are available
  const hooks = ['useVoiceToText', 'useEnhancedVoiceToText'];
  hooks.forEach(hook => {
    if (typeof window[hook] !== 'undefined') {
      console.log(`✅ ${hook} hook is available`);
    } else {
      console.log(`⚠️ ${hook} hook is not available globally`);
    }
  });
}

// Test function to check browser compatibility
function testBrowserCompatibility() {
  console.log('\n🌐 Testing Browser Compatibility...');
  
  const userAgent = navigator.userAgent;
  console.log('User Agent:', userAgent);
  
  // Check for Chrome
  if (userAgent.includes('Chrome')) {
    console.log('✅ Chrome detected - Full SpeechRecognition support');
  } else if (userAgent.includes('Safari')) {
    console.log('✅ Safari detected - SpeechRecognition support with webkit prefix');
  } else if (userAgent.includes('Edge')) {
    console.log('✅ Edge detected - SpeechRecognition support');
  } else if (userAgent.includes('Firefox')) {
    console.log('⚠️ Firefox detected - Limited SpeechRecognition support');
  } else {
    console.log('⚠️ Unknown browser - SpeechRecognition support unknown');
  }
  
  // Check for HTTPS
  if (location.protocol === 'https:') {
    console.log('✅ HTTPS detected - Required for microphone access');
  } else if (location.hostname === 'localhost') {
    console.log('✅ Localhost detected - Microphone access allowed');
  } else {
    console.log('⚠️ HTTP detected - Microphone access may be blocked');
  }
}

// Main test function
async function runAllVoiceTests() {
  console.log('🚀 Running All Voice Chat Tests...');
  
  testBrowserCompatibility();
  testSpeechRecognitionSupport();
  await testMicrophonePermissions();
  testWhisperAPI();
  testReactComponents();
  testVoiceInputComponent();
  
  console.log('\n🎉 All voice tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('1. Check browser compatibility above');
  console.log('2. Ensure microphone permissions are granted');
  console.log('3. Look for VoiceInput components in the chat areas');
  console.log('4. Try clicking the mic button to test voice input');
  console.log('5. Speak clearly and check if text appears in the input field');
  
  console.log('\n💡 Usage Instructions:');
  console.log('- Click the microphone icon to start recording');
  console.log('- Speak clearly into your microphone');
  console.log('- Click the mic again or wait for speech to end');
  console.log('- Check if transcribed text appears in the input field');
  console.log('- The text should be ready to send as a message');
}

// Export functions for manual testing
window.testSpeechRecognitionSupport = testSpeechRecognitionSupport;
window.testMicrophonePermissions = testMicrophonePermissions;
window.testWhisperAPI = testWhisperAPI;
window.testVoiceInputComponent = testVoiceInputComponent;
window.testReactComponents = testReactComponents;
window.testBrowserCompatibility = testBrowserCompatibility;
window.runAllVoiceTests = runAllVoiceTests;

console.log('\n🚀 Voice test functions loaded!');
console.log('Run runAllVoiceTests() to test all voice features');
console.log('Or run individual tests: testSpeechRecognitionSupport(), testMicrophonePermissions(), etc.');

// Auto-run tests
runAllVoiceTests();
