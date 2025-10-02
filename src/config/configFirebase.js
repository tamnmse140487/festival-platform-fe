import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: "select_account" });

export async function getGoogleIdTokenWithPopup() {
  const { signInWithPopup } = await import("firebase/auth");
  const res = await signInWithPopup(auth, googleAuthProvider);
  return res.user.getIdToken();
}

export { app, auth, googleAuthProvider };
