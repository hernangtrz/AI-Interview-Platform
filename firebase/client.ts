// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsScqZzOIxRpf9uCuWZuRNk8MywsQyPSc",
  authDomain: "prepwise-614c4.firebaseapp.com",
  projectId: "prepwise-614c4",
  storageBucket: "prepwise-614c4.firebasestorage.app",
  messagingSenderId: "198075807525",
  appId: "1:198075807525:web:7bfc6a49a1e35a61968ccc",
  measurementId: "G-LV8MJSQCZT",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
