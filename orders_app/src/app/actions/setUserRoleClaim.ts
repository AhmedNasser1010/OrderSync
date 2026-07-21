"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function setUserRoleClaim(
  uid: string,
  role: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!uid || !role) {
      return { success: false, error: "UID and role are required." };
    }

    const app = await initAdmin();
    const auth = getAuth(app);
    await auth.setCustomUserClaims(uid, { role });

    console.log(
      "Server Action [setUserRoleClaim]: Set role claim",
      role,
      "for user",
      uid,
    );
    return { success: true };
  } catch (error: unknown) {
    console.error("Error setting user role claim:", error);
    return { success: false, error: "Failed to set role claim" };
  }
}
