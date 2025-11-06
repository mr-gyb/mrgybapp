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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
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

// Handle Firestore connection errors
export const handleFirestoreError = (error: any) => {
  console.error('🔥 Firestore error:', error);
  
  // Check for QUIC protocol errors
  if (error.message?.includes('QUIC_PROTOCOL_ERROR') || 
      error.message?.includes('WebChannelConnection') ||
      error.message?.includes('transport errored')) {
    
    console.warn('⚠️ QUIC protocol error detected - attempting recovery...');
    
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