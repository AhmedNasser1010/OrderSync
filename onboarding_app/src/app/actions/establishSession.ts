"use server";

import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import {
  createSessionCookie,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";

export type SessionResult =
  | { success: true; uid: string }
  | { success: false; code: string };

export async function establishSession(
  idToken: string
): Promise<SessionResult> {
  if (!idToken) {
    return { success: false, code: "MISSING_TOKEN" };
  }
  try {
    const app = await initAdmin();
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(idToken);
    const session = await createSessionCookie(idToken);
    await setSessionCookie(session);
    return { success: true, uid: decoded.uid };
  } catch {
    return { success: false, code: "INVALID_TOKEN" };
  }
}

export async function revokeSession(): Promise<{ success: true }> {
  await clearSessionCookie();
  return { success: true };
}
