"use server";

import { clearSessionCookie } from "@/lib/auth/session";

export async function clearSession(): Promise<{ success: boolean }> {
  await clearSessionCookie();
  return { success: true };
}
