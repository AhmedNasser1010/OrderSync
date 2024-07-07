import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

!import.meta.env.FIREBASE_API && console.error('Error FIREBASE_API .env value not found!')
!import.meta.env.FIREBASE_AUTHDOMAIN && console.error('Error FIREBASE_AUTHDOMAIN .env value not found!')
!import.meta.env.PROJECT_ID && console.error('Error PROJECT_ID .env value not found!')
!import.meta.env.STORAGE_BUCKET && console.error('Error STORAGE_BUCKET .env value not found!')
!import.meta.env.MESS_SEND_ID && console.error('Error MESS_SEND_ID .env value not found!')
!import.meta.env.APP_ID && console.error('Error APP_ID .env value not found!')
!import.meta.env.MEASUREMENTID && console.error('Error MEASUREMENT_ID .env value not found!')

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API || "AIzaSyBeH_AMxj4EC4tgDG39z8MTHh6SlmgAljc",
  authDomain: import.meta.env.FIREBASE_AUTHDOMAIN || "pos-system-0.firebaseapp.com",
  projectId: import.meta.env.PROJECT_ID || "pos-system-0",
  storageBucket: import.meta.env.STORAGE_BUCKET || "pos-system-0.appspot.com",
  messagingSenderId: import.meta.env.MESS_SEND_ID || "966111235551",
  appId: import.meta.env.APP_ID || "1:966111235551:web:cce7b024741256de2fc86a",
  measurementId: import.meta.env.MEASUREMENTID || "G-NK474TDXKE"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };