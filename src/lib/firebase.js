import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const envApiKey = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_FIREBASE_API_KEY : process.env.VITE_FIREBASE_API_KEY;

const firebaseOptions = {
  ...firebaseConfig,
  apiKey: envApiKey || firebaseConfig.apiKey || '',
};

const app = getApps().length === 0 ? initializeApp(firebaseOptions) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
let auth = null;
let googleAuthProvider = null;

try {
  if (firebaseOptions.apiKey && firebaseOptions.apiKey.trim() !== '') {
    auth = getAuth(app);
    googleAuthProvider = new GoogleAuthProvider();
  }
} catch (err) {
  console.warn('Firebase Auth client not initialized:', err.message);
}

export { auth, googleAuthProvider };
