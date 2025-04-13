import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCyu60ZPik89FIzoXRJxHvF5Z0VagxaTyg",
    authDomain: "carboncompanion-7b4ef.firebaseapp.com",
    projectId: "carboncompanion-7b4ef",
    storageBucket: "carboncompanion-7b4ef.firebasestorage.app",
    messagingSenderId: "651578582887",
    appId: "1:651578582887:web:46ea62077ba7628353b1c2"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);