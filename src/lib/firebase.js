import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDGc1Cy07Cdrb1xi0-QeS1qRe9I1xJXlxo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gear-plug.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gear-plug",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gear-plug.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "565997758146",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:565997758146:web:c3c2e143d2601268f6bd5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
