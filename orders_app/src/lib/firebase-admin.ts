import "server-only";

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

interface FirebaseAdminAppParams {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

export function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
  const { projectId, clientEmail, privateKey } = params;

  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formatPrivateKey(privateKey),
    }),
    projectId,
  });
}

export async function initAdmin() {
  const params = {
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: process.env.FIREBASE_PRIVATE_KEY as string,
  };

  if (!params.projectId || !params.clientEmail || !params.privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. " +
        "Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables. " +
        "NEXT_PUBLIC_PROJECT_ID is already configured in .env.local."
    );
  }

  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  }

  return createFirebaseAdminApp(params);
}
