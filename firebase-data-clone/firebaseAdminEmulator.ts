import "dotenv/config";

import {
  initializeApp,
  cert,
  getApps,
  ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "./serviceAccount.json";

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
    projectId: serviceAccount.project_id,
  });
}

export const emulatorDb = getFirestore();
export const emulatorAuth = getAuth();
