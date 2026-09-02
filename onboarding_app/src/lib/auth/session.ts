import "server-only";

import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { initAdmin } from "@/lib/firebase-admin";

export const SESSION_COOKIE_NAME = "__session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function getSessionCookieValue(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function setSessionCookie(value: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function createSessionCookie(idToken: string): Promise<string> {
  const app = await initAdmin();
  const auth = getAuth(app);
  return auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });
}

export async function verifySessionCookie(
  session: string
): Promise<{ uid: string; email?: string } | null> {
  const app = await initAdmin();
  const auth = getAuth(app);
  try {
    const decoded = await auth.verifySessionCookie(session, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
