import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
//   projectId: import.meta.env.VITE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_MESS_SEND_ID,
//   appId: import.meta.env.VITE_APP_ID
// };

const firebaseConfig = {
  apiKey: 'AIzaSyBeH_AMxj4EC4tgDG39z8MTHh6SlmgAljc',
  authDomain: 'pos-system-0.firebaseapp.com',
  projectId: 'pos-system-0',
  storageBucket: 'pos-system-0.appspot.com',
  messagingSenderId: '966111235551',
  appId: '1:966111235551:web:3b28a5df24d297e42fc86a'
};

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

export {auth, db}