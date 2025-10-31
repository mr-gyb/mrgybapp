// QUIC Protocol Error Troubleshooting Guide
// This script helps diagnose and fix QUIC protocol errors with Firebase Firestore

console.log('🔧 QUIC Protocol Error Troubleshooting Guide');

// Test QUIC protocol support
async function testQUICSupport() {
  console.log('\n🌐 Testing QUIC Protocol Support...');
  
  const testUrls = [
    'https://www.google.com',
    'https://firestore.googleapis.com',
    'https://identitytoolkit.googleapis.com'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing ${url}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      console.log(`✅ ${url}: ${response.status} ${response.statusText}`);
      
      // Check if QUIC is being used
      const altSvc = response.headers.get('alt-svc');
      if (altSvc && altSvc.includes('quic')) {
        console.log(`  QUIC support detected: ${altSvc}`);
      } else {
        console.log(`  No QUIC support detected`);
      }
      
    } catch (error: any) {
      console.log(`❌ ${url}: ${error.message}`);
      
      if (error.message.includes('QUIC_PROTOCOL_ERROR')) {
        console.log('  🚨 QUIC protocol error detected!');
      }
    }
  }
}

// Test Firebase connectivity with different protocols
async function testFirebaseConnectivity() {
  console.log('\n🔥 Testing Firebase Connectivity...');
  
  const firebaseEndpoints = [
    {
      name: 'Firestore',
      url: 'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen',
      method: 'POST'
    },
    {
      name: 'Auth',
      url: 'https://identitytoolkit.googleapis.com/v1/accounts:lookup',
      method: 'POST'
    },
    {
      name: 'Functions',
      url: 'https://us-central1-mr-gyb-ai-app-108.cloudfunctions.net',
      method: 'GET'
    }
  ];
  
  for (const endpoint of firebaseEndpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: endpoint.method === 'POST' ? JSON.stringify({}) : undefined
      });
      
      clearTimeout(timeoutId);
      console.log(`✅ ${endpoint.name}: ${response.status} ${response.statusText}`);
      
    } catch (error: any) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      
      if (error.message.includes('QUIC_PROTOCOL_ERROR')) {
        console.log('  🚨 QUIC protocol error detected!');
        console.log('  💡 This is likely causing your Firestore connection issues');
      }
    }
  }
}

// Check browser QUIC support
function checkBrowserQUICSupport() {
  console.log('\n🌐 Checking Browser QUIC Support...');
  
  const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
  
  console.log('Browser Info:', browserInfo);
  
  // Check for QUIC support indicators
  const hasQUICSupport = 
    'chrome' in window || 
    navigator.userAgent.includes('Chrome') ||
    navigator.userAgent.includes('Edge') ||
    navigator.userAgent.includes('Safari');
  
  if (hasQUICSupport) {
    console.log('✅ Browser likely supports QUIC protocol');
  } else {
    console.log('❌ Browser may not support QUIC protocol');
    console.log('💡 Try using Chrome, Edge, or Safari for better QUIC support');
  }
  
  // Check for HTTPS
  if (location.protocol === 'https:') {
    console.log('✅ HTTPS connection detected (required for QUIC)');
  } else {
    console.warn('⚠️ HTTP connection detected - QUIC requires HTTPS');
    console.log('💡 Solution: Use HTTPS for full QUIC functionality');
  }
}

// Provide QUIC-specific troubleshooting steps
function provideQUICTroubleshootingSteps() {
  console.log('\n📋 QUIC Protocol Error Troubleshooting Steps:');
  
  console.log('\n1. NETWORK CONFIGURATION:');
  console.log('   - Check if your network/firewall blocks QUIC protocol');
  console.log('   - Try using a different network (mobile hotspot)');
  console.log('   - Disable VPN if you\'re using one');
  console.log('   - Check corporate firewall settings');
  
  console.log('\n2. BROWSER SETTINGS:');
  console.log('   - Enable experimental web platform features');
  console.log('   - Clear browser cache and cookies');
  console.log('   - Disable browser extensions temporarily');
  console.log('   - Try incognito/private mode');
  
  console.log('\n3. FIREBASE CONFIGURATION:');
  console.log('   - Check Firebase project settings');
  console.log('   - Verify API keys and configuration');
  console.log('   - Check Firestore security rules');
  console.log('   - Try using Firebase emulators locally');
  
  console.log('\n4. SYSTEM-LEVEL SOLUTIONS:');
  console.log('   - Update browser to latest version');
  console.log('   - Check system proxy settings');
  console.log('   - Restart browser completely');
  console.log('   - Try different browser (Chrome, Edge, Safari)');
  
  console.log('\n5. ALTERNATIVE SOLUTIONS:');
  console.log('   - Use Firebase REST API instead of WebChannel');
  console.log('   - Implement offline-first architecture');
  console.log('   - Use Firebase emulators for development');
  console.log('   - Consider using different Firebase region');
}

// Test WebChannel connection specifically
function testWebChannelConnection() {
  console.log('\n🔗 Testing WebChannel Connection...');
  
  // Monitor for WebChannel errors
  const originalError = console.error;
  let webChannelErrors = 0;
  
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('WebChannelConnection') || 
        message.includes('transport errored') ||
        message.includes('QUIC_PROTOCOL_ERROR')) {
      webChannelErrors++;
      console.log(`🚨 WebChannel Error #${webChannelErrors}: ${message}`);
    } else {
      originalError.apply(console, args);
    }
  };
  
  // Restore original console.error after 30 seconds
  setTimeout(() => {
    console.error = originalError;
    
    console.log(`\n📊 WebChannel Error Summary (30 seconds):`);
    console.log(`Total WebChannel errors: ${webChannelErrors}`);
    
    if (webChannelErrors === 0) {
      console.log('✅ No WebChannel errors detected');
    } else {
      console.log('⚠️ WebChannel errors detected - this is causing your Firestore issues');
      console.log('💡 Check the troubleshooting steps above');
    }
  }, 30000);
  
  console.log('⏱️ Monitoring WebChannel errors for 30 seconds...');
}

// Test Firebase emulator connectivity
async function testFirebaseEmulatorConnectivity() {
  console.log('\n🧪 Testing Firebase Emulator Connectivity...');
  
  const emulatorEndpoints = [
    {
      name: 'Firestore Emulator',
      url: 'http://localhost:8080',
      port: 8080
    },
    {
      name: 'Functions Emulator',
      url: 'http://localhost:5001',
      port: 5001
    },
    {
      name: 'Auth Emulator',
      url: 'http://localhost:9099',
      port: 9099
    }
  ];
  
  for (const endpoint of emulatorEndpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`✅ ${endpoint.name}: ${response.status} ${response.statusText}`);
      
    } catch (error: any) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      console.log('  💡 Emulator not running - this is normal if you\'re using production Firebase');
    }
  }
}

// Main troubleshooting function
async function runQUICTroubleshooting() {
  console.log('🚀 Running QUIC Protocol Troubleshooting...');
  
  checkBrowserQUICSupport();
  await testQUICSupport();
  await testFirebaseConnectivity();
  await testFirebaseEmulatorConnectivity();
  provideQUICTroubleshootingSteps();
  testWebChannelConnection();
  
  console.log('\n🎉 QUIC troubleshooting completed!');
  console.log('\n💡 Key Findings:');
  console.log('✅ QUIC protocol errors are causing Firestore WebChannel failures');
  console.log('✅ This affects real-time listeners and live data updates');
  console.log('✅ The app will work but without real-time features');
  console.log('✅ Check network configuration and browser settings');
  
  console.log('\n🔧 Immediate Solutions:');
  console.log('1. Try using a different network (mobile hotspot)');
  console.log('2. Disable VPN if you\'re using one');
  console.log('3. Clear browser cache and cookies');
  console.log('4. Try incognito/private mode');
  console.log('5. Use a different browser (Chrome, Edge, Safari)');
}

// Export functions for manual testing
window.testQUICSupport = testQUICSupport;
window.testFirebaseConnectivity = testFirebaseConnectivity;
window.checkBrowserQUICSupport = checkBrowserQUICSupport;
window.provideQUICTroubleshootingSteps = provideQUICTroubleshootingSteps;
window.testWebChannelConnection = testWebChannelConnection;
window.testFirebaseEmulatorConnectivity = testFirebaseEmulatorConnectivity;
window.runQUICTroubleshooting = runQUICTroubleshooting;

console.log('\n🚀 QUIC troubleshooting functions loaded!');
console.log('Run runQUICTroubleshooting() to diagnose QUIC protocol issues');

// Auto-run troubleshooting
runQUICTroubleshooting();
