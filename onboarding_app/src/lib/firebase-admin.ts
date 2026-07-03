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

  // If already initialized, return the existing app
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }

  // Initialize the Firebase admin app
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

  return createFirebaseAdminApp(params);
}

export async function getUserUidByEmail(email: string): Promise<string | null> {
  try {
    const app = await initAdmin();
    const auth = getAuth(app);
    const userRecord = await auth.getUserByEmail(email);
    return userRecord.uid;
  } catch (error: unknown) {
    // If user not found, return null
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "auth/user-not-found"
    ) {
      return null;
    }
    throw error;
  }
}