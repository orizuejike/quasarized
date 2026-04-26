import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration exactly as provided
const firebaseConfig = {
  apiKey: "AIzaSyBP3jTXl5hVD8Z4b2r_gqv6Wu8VLkkgonU",
  authDomain: "quasarized-platform.firebaseapp.com",
  projectId: "quasarized-platform",
  storageBucket: "quasarized-platform.firebasestorage.app",
  messagingSenderId: "120811174209",
  appId: "1:120811174209:web:a3ee803e46ad22a956c9c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication and Database protocols so your website can use them
export const auth = getAuth(app);
export const db = getFirestore(app);