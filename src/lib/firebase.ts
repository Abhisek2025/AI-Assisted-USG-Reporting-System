import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const envApiKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_FIREBASE_API_KEY;

const firebaseOptions = {
  ...firebaseConfig,
  apiKey: envApiKey || firebaseConfig.apiKey || '',
};

const app = getApps().length === 0 ? initializeApp(firebaseOptions) : getApps()[0];
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
let auth: Auth | null = null;
let googleAuthProvider: GoogleAuthProvider | null = null;

try {
  if (firebaseOptions.apiKey && firebaseOptions.apiKey.trim() !== '') {
    auth = getAuth(app);
    googleAuthProvider = new GoogleAuthProvider();
  }
} catch (err) {
  console.warn('Firebase Auth client not initialized:', err);
}

export { auth, googleAuthProvider };

