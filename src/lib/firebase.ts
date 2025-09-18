// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'studio-2087631120-1e885',
  appId: '1:46051923623:web:211ee1d424c6d748f62d82',
  storageBucket: 'studio-2087631120-1e885.firebasestorage.app',
  apiKey: 'AIzaSyDoepq4uLHE5arPNLOmlsyVoBoHzuqBkyQ',
  authDomain: 'studio-2087631120-1e885.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '46051923623',
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
