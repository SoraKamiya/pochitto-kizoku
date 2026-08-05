import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Values come from a Firebase Web App config (Firebase console > Project settings).
// Copy .env.example to .env.local and fill these in — see docs/SPEC.md for the
// intended Firestore layout (a single open-access `orders` collection).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
