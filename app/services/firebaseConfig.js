// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFyDeqmRvrVaunGTAS3Wb3_pmxABN-ReU",
  authDomain: "alarm-project-3d9b3.firebaseapp.com",
  projectId: "alarm-project-3d9b3",
  storageBucket: "alarm-project-3d9b3.firebasestorage.app",
  messagingSenderId: "1097820826450",
  appId: "1:1097820826450:web:18abdedd9078d70011288b",
  measurementId: "G-6EQPPCT9ZT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
