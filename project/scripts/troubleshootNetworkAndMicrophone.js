// Network Connectivity and Microphone Troubleshooting Guide
// This script helps diagnose and fix network and microphone issues

console.log('🔧 Network & Microphone Troubleshooting Guide');

// Check network connectivity
async function checkNetworkConnectivity() {
  console.log('\n🌐 Checking Network Connectivity...');
  
  const tests = [
    {
      name: 'Google DNS',
      url: 'https://8.8.8.8',
      timeout: 5000
    },
    {
      name: 'Cloudflare DNS',
      url: 'https://1.1.1.1',
      timeout: 5000
    },
    {
      name: 'Google.com',
      url: 'https://www.google.com',
      timeout: 10000
    },
    {
      name: 'Firebase API',
      url: 'https://identitytoolkit.googleapis.com',
      timeout: 10000
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), test.timeout);
      
      const response = await fetch(test.url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      });
      
      clearTimeout(timeoutId);
      console.log(`✅ ${test.name}: Connected`);
    } catch (error: any) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}

// Check microphone permissions and hardware
async function checkMicrophoneAccess() {
  console.log('\n🎙️ Checking Microphone Access...');
  
  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('❌ getUserMedia not supported in this browser');
      return false;
    }
    
    console.log('✅ getUserMedia is supported');
    
    // Check microphone permissions
    const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    console.log('Microphone permission status:', permissions.state);
    
    if (permissions.state === 'denied') {
      console.error('❌ Microphone permission denied');
      console.log('💡 Solution: Grant microphone permissions in browser settings');
      return false;
    }
    
    // Try to access microphone
    console.log('Attempting to access microphone...');
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    console.log('✅ Microphone access granted');
    console.log('Audio tracks:', stream.getAudioTracks().length);
    
    // Check audio track properties
    stream.getAudioTracks().forEach((track, index) => {
      console.log(`Track ${index + 1}:`, {
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      });
    });
    
    // Stop the stream
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Microphone stream stopped');
    
    return true;
  } catch (error: any) {
    console.error('❌ Microphone access failed:', error.message);
    
    switch (error.name) {
      case 'NotAllowedError':
        console.log('💡 Solution: Grant microphone permissions in browser settings');
        break;
      case 'NotFoundError':
        console.log('💡 Solution: Check if microphone is connected and not being used by another app');
        break;
      case 'NotReadableError':
        console.log('💡 Solution: Microphone may be in use by another application');
        break;
      case 'OverconstrainedError':
        console.log('💡 Solution: Microphone constraints cannot be satisfied');
        break;
      case 'SecurityError':
        console.log('💡 Solution: Microphone access blocked by security policy');
        break;
      default:
        console.log('💡 Solution: Check microphone hardware and browser compatibility');
    }
    
    return false;
  }
}

// Check browser compatibility
function checkBrowserCompatibility() {
  console.log('\n🌐 Checking Browser Compatibility...');
  
  const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
  
  console.log('Browser Info:', browserInfo);
  
  // Check for SpeechRecognition support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    console.log('✅ SpeechRecognition API is supported');
  } else {
    console.error('❌ SpeechRecognition API not supported');
    console.log('💡 Solution: Use Chrome, Safari, or Edge for best support');
  }
  
  // Check for HTTPS
  if (location.protocol === 'https:') {
    console.log('✅ HTTPS connection detected');
  } else {
    console.warn('⚠️ HTTP connection detected - microphone access may be limited');
    console.log('💡 Solution: Use HTTPS for full microphone functionality');
  }
}

// Check Firebase connectivity
async function checkFirebaseConnectivity() {
  console.log('\n🔥 Checking Firebase Connectivity...');
  
  const firebaseEndpoints = [
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://firestore.googleapis.com',
    'https://firebase.googleapis.com'
  ];
  
  for (const endpoint of firebaseEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log(`✅ ${endpoint}: Accessible`);
    } catch (error: any) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Provide troubleshooting steps
function provideTroubleshootingSteps() {
  console.log('\n📋 Troubleshooting Steps:');
  
  console.log('\n1. NETWORK ISSUES:');
  console.log('   - Check your internet connection');
  console.log('   - Try refreshing the page');
  console.log('   - Check if firewall is blocking connections');
  console.log('   - Try using a different network (mobile hotspot)');
  
  console.log('\n2. MICROPHONE ISSUES:');
  console.log('   - Grant microphone permissions when prompted');
  console.log('   - Check if microphone is connected');
  console.log('   - Ensure no other app is using the microphone');
  console.log('   - Try using Chrome, Safari, or Edge');
  console.log('   - Check browser settings for microphone access');
  
  console.log('\n3. FIREBASE ISSUES:');
  console.log('   - Check internet connection');
  console.log('   - Verify Firebase configuration');
  console.log('   - Check if Firebase services are accessible');
  console.log('   - Try clearing browser cache and cookies');
  
  console.log('\n4. BROWSER ISSUES:');
  console.log('   - Update browser to latest version');
  console.log('   - Disable browser extensions temporarily');
  console.log('   - Try incognito/private mode');
  console.log('   - Clear browser cache and cookies');
}

// Test offline functionality
function testOfflineFunctionality() {
  console.log('\n📱 Testing Offline Functionality...');
  
  if (navigator.onLine) {
    console.log('✅ Device is online');
  } else {
    console.log('❌ Device is offline');
    console.log('💡 Solution: Check internet connection');
  }
  
  // Test service worker availability
  if ('serviceWorker' in navigator) {
    console.log('✅ Service Worker supported');
  } else {
    console.log('❌ Service Worker not supported');
  }
}

// Main troubleshooting function
async function runComprehensiveTroubleshooting() {
  console.log('🚀 Running Comprehensive Troubleshooting...');
  
  checkBrowserCompatibility();
  await checkNetworkConnectivity();
  await checkFirebaseConnectivity();
  await checkMicrophoneAccess();
  testOfflineFunctionality();
  provideTroubleshootingSteps();
  
  console.log('\n🎉 Troubleshooting completed!');
  console.log('\n💡 Next Steps:');
  console.log('1. Fix any network connectivity issues');
  console.log('2. Grant microphone permissions');
  console.log('3. Try using a different browser');
  console.log('4. Check if other applications are using the microphone');
  console.log('5. Restart the browser if issues persist');
}

// Export functions for manual testing
window.checkNetworkConnectivity = checkNetworkConnectivity;
window.checkMicrophoneAccess = checkMicrophoneAccess;
window.checkBrowserCompatibility = checkBrowserCompatibility;
window.checkFirebaseConnectivity = checkFirebaseConnectivity;
window.provideTroubleshootingSteps = provideTroubleshootingSteps;
window.testOfflineFunctionality = testOfflineFunctionality;
window.runComprehensiveTroubleshooting = runComprehensiveTroubleshooting;

console.log('\n🚀 Troubleshooting functions loaded!');
console.log('Run runComprehensiveTroubleshooting() to diagnose all issues');

// Auto-run troubleshooting
runComprehensiveTroubleshooting();
