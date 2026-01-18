import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfigStorage, FirebaseConfig } from './firebaseConfigStorage';

// Get Firebase config from stored config (from landing page) or fallback to env vars
const getFirebaseConfig = (): FirebaseConfig => {
  // First, try to load from localStorage (received from landing page)
  const storedConfig = firebaseConfigStorage.load();
  if (storedConfig) {
    return storedConfig;
  }

  // Fallback to environment variables
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
};

const firebaseConfig = getFirebaseConfig();

// Only initialize if we have valid config
const app = !getApps().length && firebaseConfig.apiKey 
    ? initializeApp(firebaseConfig) 
    : getApps().length > 0 
        ? getApp() 
        : null;

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, db, storage, firebaseConfig };
