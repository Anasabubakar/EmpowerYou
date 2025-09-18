// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-2087631120-1e885",
  "appId": "1:46051923623:web:211ee1d424c6d748f62d82",
  "storageBucket": "studio-2087631120-1e885.firebasestorage.app",
  "apiKey": "AIzaSyDoepq4uLHE5arPNLOmlsyVoBoHzuqBkyQ",
  "authDomain": "studio-2087631120-1e885.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "46051923623"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
