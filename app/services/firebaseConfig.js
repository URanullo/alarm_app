import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, getReactNativePersistence, initializeAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyCFyDeqmRvrVaunGTAS3Wb3_pmxABN-ReU",
  authDomain: "alarm-project-3d9b3.firebaseapp.com",
  projectId: "alarm-project-3d9b3",
  storageBucket: "alarm-project-3d9b3.firebasestorage.app",
  messagingSenderId: "1097820826450",
  appId: "1:1097820826450:web:18abdedd9078d70011288b",
  measurementId: "G-6EQPPCT9ZT"
};

// Ensure we don't initialize multiple times during HMR or re-imports
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
  try {
    setPersistence(auth, browserLocalPersistence);
  } catch (_) {
    // ignore persistence errors in non-browser contexts
  }
} else {
  try {
    // If Auth is already initialized for RN, reuse it
    auth = getAuth(app);
  } catch (_err) {
    // Initialize Auth once for React Native
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
}

export { app, auth, db, storage };

