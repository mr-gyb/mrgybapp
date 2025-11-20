import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, FacebookAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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

// Log auth domain for debugging
if (import.meta.env.DEV) {
  console.log('Firebase Auth Domain:', firebaseConfig.authDomain);
  console.log('Firebase Project ID:', firebaseConfig.projectId);
}

// Configure Facebook Auth Provider
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export default app;