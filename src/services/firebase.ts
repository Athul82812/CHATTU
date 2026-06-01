import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6t5NH0n0RtByQjMt12aa8-H9hn_efUbI",
  authDomain: "chattu-19b0b.firebaseapp.com",
  projectId: "chattu-19b0b",
  storageBucket: "chattu-19b0b.appspot.com", // ✅ FIXED
  messagingSenderId: "567813185599",
  appId: "1:567813185599:web:e17a99266579415100588a",
};

// ✅ Prevent re-initialization error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);