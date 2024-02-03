import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeH_AMxj4EC4tgDG39z8MTHh6SlmgAljc",
  authDomain: "pos-system-0.firebaseapp.com",
  projectId: "pos-system-0",
  storageBucket: "pos-system-0.appspot.com",
  messagingSenderId: "966111235551",
  appId: "1:966111235551:web:cce7b024741256de2fc86a",
  measurementId: "G-NK474TDXKE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };