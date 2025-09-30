// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  projectId: "studio-2087631120-1e885",
  appId: "1:46051923623:web:211ee1d424c6d748f62d82",
  storageBucket: "studio-2087631120-1e885.firebasestorage.app",
  apiKey: "AIzaSyDoepq4uLHE5arPNLOmlsyVoBoHzuqBkyQ",
  authDomain: "studio-2087631120-1e885.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "46051923623"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
