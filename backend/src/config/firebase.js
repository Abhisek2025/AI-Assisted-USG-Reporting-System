// backend/src/config/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { readFileSync } from 'fs';
import { join } from 'path';

// Silence verbose/internal BloomFilter logs from SDK
setLogLevel('error');

let firebaseConfig;
try {
  const configPath = join(process.cwd(), 'firebase-applet-config.json');
  const rawData = readFileSync(configPath, 'utf8');
  firebaseConfig = JSON.parse(rawData);
} catch (e) {
  console.warn('Could not read firebase-applet-config.json, using default credentials');
  firebaseConfig = {
    projectId: "folkloric-album-qcf5x",
    appId: "1:905749985645:web:a0c0b713f5ffa2be7cc264",
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
    authDomain: "folkloric-album-qcf5x.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-aiassistedusgrep-c0b882be-a1ca-475d-bd6c-fa423c36a73a"
  };
}

if (!firebaseConfig.apiKey) {
  firebaseConfig.apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "";
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firestoreDb = firebaseConfig.firestoreDatabaseId
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

let firebaseAuth = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== '') {
    firebaseAuth = getAuth(app);
  }
} catch (err) {
  console.warn('Firebase Client Auth not initialized:', err.message);
}

export { firebaseAuth, firebaseConfig };
