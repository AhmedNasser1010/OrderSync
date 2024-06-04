import { initializeApp } from 'firebase/app';
import config from './config.js';
import { getFirestore } from 'firebase/firestore';

export const firebase = initializeApp(config.firebaseConfig);
export const db = getFirestore(firebase);