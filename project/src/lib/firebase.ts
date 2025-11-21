import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth, FacebookAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
const missingConfig = [];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_firebase_api_key_here') {
  missingConfig.push('VITE_FIREBASE_API_KEY');
}
if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your_project')) {
  missingConfig.push('VITE_FIREBASE_AUTH_DOMAIN');
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === 'your_project_id') {
  missingConfig.push('VITE_FIREBASE_PROJECT_ID');
}

if (missingConfig.length > 0) {
  console.error('❌ Firebase Configuration Error:', {
    message: 'Missing or invalid Firebase environment variables',
    missing: missingConfig,
    help: 'Please create a .env file in the project/ directory with valid Firebase credentials.',
    template: 'See env-template.txt for the required format.',
    console: 'https://console.firebase.google.com/project/mr-gyb-ai-app-108/settings/general'
  });
}

// Check for expired API key pattern
if (firebaseConfig.apiKey && firebaseConfig.apiKey.includes('AIzaSyDPvjv_Aa-7h7-TZkpJ94n3oigt0t8Z2xI')) {
  console.error('❌ Firebase API Key Expired:', {
    message: 'Your Firebase API key has expired. Please get a new one from Firebase Console.',
    action: '1. Go to Firebase Console → Project Settings → Your apps',
    action2: '2. Copy the new API key',
    action3: '3. Update VITE_FIREBASE_API_KEY in your .env file',
    action4: '4. Restart your development server',
    console: 'https://console.firebase.google.com/project/mr-gyb-ai-app-108/settings/general'
  });
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  console.error('❌ Firebase Initialization Error:', {
    message: error.message || 'Failed to initialize Firebase',
    error: error.code || 'unknown',
    help: 'Please check your Firebase configuration in .env file'
  });
  throw error;
}

// Initialize services with optimized settings
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: false, // Use WebSocket/QUIC by default
});

export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Configure Facebook Auth Provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

// Connect to emulators in development (only if explicitly enabled)
// To use emulators, set VITE_USE_EMULATORS=true in your .env file
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (import.meta.env.DEV && useEmulators) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Connected to Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Firebase emulators not available, using production Firebase');
  }
} else if (import.meta.env.DEV) {
  console.log('🔧 Using production Firebase (emulators disabled)');
}

// Firestore connection management
let isFirestoreOnline = true;
let connectionRetryCount = 0;
const maxRetries = 3;

// Monitor Firestore connection status
export const monitorFirestoreConnection = () => {
  // Listen for online/offline events
  window.addEventListener('online', async () => {
    console.log('🌐 Network back online - reconnecting Firestore...');
    try {
      await enableNetwork(db);
      isFirestoreOnline = true;
      connectionRetryCount = 0;
      console.log('✅ Firestore reconnected');
    } catch (error) {
      console.error('❌ Failed to reconnect Firestore:', error);
    }
  });

  window.addEventListener('offline', async () => {
    console.log('📴 Network offline - disabling Firestore...');
    try {
      await disableNetwork(db);
      isFirestoreOnline = false;
      console.log('⚠️ Firestore offline mode enabled');
    } catch (error) {
      console.error('❌ Failed to disable Firestore:', error);
    }
  });
};

// Suppress harmless QUIC protocol errors and index errors (they show as errors but are expected)
// These are browser network protocol quirks - Firestore handles them automatically
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = String(args[0] || '');
    
    // Filter out harmless QUIC protocol errors (status 200 means success)
    if (message.includes('ERR_QUIC_PROTOCOL_ERROR') && message.includes('200')) {
      // These are harmless - Firestore automatically retries and succeeds
      return;
    }
    
    // Filter out specific QUIC error types that are harmless (QUIC_TOO_MANY_RTOS, QUIC_PUBLIC_RESET)
    if (message.includes('ERR_QUIC_PROTOCOL_ERROR.QUIC_TOO_MANY_RTOS') ||
        message.includes('ERR_QUIC_PROTOCOL_ERROR.QUIC_PUBLIC_RESET')) {
      // These are network protocol quirks - Firestore handles them automatically
      return;
    }
    
    // Filter out WebChannel connection warnings that are actually successful
    if (message.includes('WebChannelConnection') && message.includes('200')) {
      return;
    }
    
    // Filter out WebChannel transport errors that are handled by Firestore
    if (message.includes('WebChannelConnection RPC') && message.includes('transport errored')) {
      // Firestore automatically handles these transport errors
      return;
    }
    
    // Filter out Firestore index errors (they're expected until indexes are created)
    if (message.includes('requires an index') || 
        (message.includes('FirebaseError') && args[1]?.code === 'failed-precondition' && args[1]?.message?.includes('index'))) {
      // These are expected - indexes need to be created in Firebase Console
      // The error object contains a link to create the index
      return;
    }
    
    originalError.apply(console, args);
  };
}

// Handle Firestore connection errors
export const handleFirestoreError = (error: any) => {
  // Skip logging QUIC errors that are actually successful (200 status)
  if (error.message?.includes('QUIC_PROTOCOL_ERROR') && 
      (error.code === 'ok' || error.status === 200)) {
    // These are harmless network protocol quirks - Firestore handles them automatically
    return;
  }
  
  // Skip specific QUIC error types that are harmless
  if (error.message?.includes('QUIC_TOO_MANY_RTOS') ||
      error.message?.includes('QUIC_PUBLIC_RESET')) {
    // These are network protocol quirks - Firestore handles them automatically
    return;
  }
  
  // Skip WebChannel transport errors (Firestore handles these automatically)
  if (error.message?.includes('WebChannelConnection') && 
      error.message?.includes('transport errored')) {
    // Firestore automatically handles these transport errors
    return;
  }
  
  // Suppress index errors with helpful message (indexes need to be created)
  if (error.code === 'failed-precondition' && error.message?.includes('index')) {
    console.warn('⚠️ Firestore index required. Click the link in the error to create it, or deploy via: firebase deploy --only firestore:indexes');
    return;
  }
  
  // Only log real errors (non-200 status, non-QUIC errors)
  if (error.status !== 200 && error.code !== 'ok' && 
      !error.message?.includes('QUIC_PROTOCOL_ERROR') &&
      !error.message?.includes('WebChannelConnection')) {
    console.error('🔥 Firestore error:', error);
  }
  
  // Check for real connection errors (non-200 status, not QUIC)
  if (error.status && error.status !== 200 && 
      error.code !== 'ok' &&
      !error.message?.includes('QUIC_PROTOCOL_ERROR') &&
      !error.message?.includes('WebChannelConnection')) {
    
    console.warn('⚠️ Firestore connection error detected - attempting recovery...');
    
    if (connectionRetryCount < maxRetries) {
      connectionRetryCount++;
      console.log(`🔄 Retry attempt ${connectionRetryCount}/${maxRetries}`);
      
      // Retry connection after a delay
      setTimeout(async () => {
        try {
          await disableNetwork(db);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await enableNetwork(db);
          console.log('✅ Firestore connection retry successful');
        } catch (retryError) {
          console.error('❌ Firestore retry failed:', retryError);
        }
      }, 2000 * connectionRetryCount); // Exponential backoff
    } else {
      console.error('❌ Max retries reached - Firestore connection failed');
      isFirestoreOnline = false;
    }
  }
};

// Initialize connection monitoring
monitorFirestoreConnection();

export default app;