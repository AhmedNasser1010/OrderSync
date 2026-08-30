"use server";

import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import {
  createSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";

export type CreateSessionResult =
  | { success: true; uid: string }
  | { success: false; code: string };

export async function establishSession(
  idToken: string
): Promise<CreateSessionResult> {
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
