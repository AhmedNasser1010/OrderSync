import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

!import.meta.env.VITE_FIREBASE_API && console.error('Error FIREBASE_API .env value not found!')
!import.meta.env.VITE_FIREBASE_AUTHDOMAIN && console.error('Error FIREBASE_AUTHDOMAIN .env value not found!')
!import.meta.env.VITE_PROJECT_ID && console.error('Error PROJECT_ID .env value not found!')
!import.meta.env.VITE_STORAGE_BUCKET && console.error('Error STORAGE_BUCKET .env value not found!')
!import.meta.env.VITE_MESS_SEND_ID && console.error('Error MESS_SEND_ID .env value not found!')
!import.meta.env.VITE_APP_ID && console.error('Error APP_ID .env value not found!')
!import.meta.env.VITE_MEASUREMENT_ID && console.error('Error MEASUREMENT_ID .env value not found!')

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESS_SEND_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };