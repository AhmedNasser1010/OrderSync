import "server-only";

import {
  getSessionCookieValue,
  verifySessionCookie,
} from "@/lib/auth/session";

export interface SessionUser {
  uid: string;
  email?: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSessionCookieValue();
  if (!session) return null;
  return verifySessionCookie(session);
}
