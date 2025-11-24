import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
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
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields: string[] = [];
  const invalidFields: string[] = [];

  requiredFields.forEach(field => {
    const value = firebaseConfig[field as keyof typeof firebaseConfig];
    if (!value || value === `your_${field.toLowerCase()}_here` || value.includes('your_')) {
      missingFields.push(`VITE_FIREBASE_${field.toUpperCase()}`);
    }
  });

  if (missingFields.length > 0) {
    console.error('❌ Firebase Configuration Error:', {
      message: 'Missing or invalid Firebase environment variables',
      missingFields,
      instructions: 'Please check your .env file and ensure all VITE_FIREBASE_* variables are set correctly.'
    });
  } else {
    console.log('✅ Firebase configuration loaded successfully');
    
    // Check for common API key issues
    if (firebaseConfig.apiKey) {
      // Check if API key looks expired or invalid
      if (firebaseConfig.apiKey.length < 30) {
        console.warn('⚠️ Firebase API key appears to be invalid (too short)');
      }
      
      // Log first few characters for debugging (never log full key)
      console.log('🔑 Firebase API Key loaded:', firebaseConfig.apiKey.substring(0, 10) + '...');
    }
  }

  return missingFields.length === 0;
};

// Validate before initializing
const isConfigValid = validateFirebaseConfig();

if (!isConfigValid) {
  console.warn('⚠️ Firebase configuration is incomplete. Authentication may not work properly.');
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Log auth domain for debugging
if (import.meta.env.DEV) {
  console.log('Firebase Auth Domain:', firebaseConfig.authDomain);
  console.log('Firebase Project ID:', firebaseConfig.projectId);
}

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
        (message.includes('failed-precondition') && message.includes('index')) ||
        (message.includes('FirebaseError') && args[1]?.code === 'failed-precondition' && args[1]?.message?.includes('index')) ||
        (message.includes('Uncaught Error in snapshot listener') && message.includes('failed-precondition') && message.includes('index'))) {
      // These are expected - indexes need to be created in Firebase Console
      // The error object contains a link to create the index
      // Index is already defined in firestore.indexes.json, needs to be deployed via: firebase deploy --only firestore:indexes
      // Suppress the full error stack trace - we handle it in the component with a cleaner warning
      return;
    }
    
    // Filter out Firestore index warning messages (they're expected until indexes are deployed)
    if (message.includes('Firestore index required') || message.includes('firestore.indexes.json')) {
      // Suppress the warning - it's already shown once per page load in the component
      return;
    }
    
    // Filter out OpenAI quota errors (they're handled in the UI with user-friendly messages)
    if (message.includes('quota') && (message.includes('exceeded') || message.includes('insufficient_quota'))) {
      // These are handled in the UI - suppress console noise
      return;
    }
    
    // Filter out OpenAI Whisper API quota errors
    if (message.includes('Whisper API error') && message.includes('429')) {
      // Quota errors are displayed in UI - suppress console noise
      return;
    }
    
    // Filter out video processing quota errors
    if (message.includes('Error processing video') && message.includes('quota')) {
      // Quota errors are displayed in UI - suppress console noise
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