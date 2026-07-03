"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function deleteAuthUser(uid: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!uid) {
      return { success: false, error: "User UID is required." };
    }

    const app = await initAdmin();
    const auth = getAuth(app);
    await auth.deleteUser(uid);

    console.log("Server Action [deleteAuthUser]: Deleted auth user", uid);
    return { success: true };
  } catch (error: unknown) {
    // If user not found in Auth, consider it a success (already deleted)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "auth/user-not-found"
    ) {
      console.log("Server Action [deleteAuthUser]: Auth user not found, skipping", uid);
      return { success: true };
    }

    console.error("Error deleting auth user:", error);
    return { success: false, error: "Failed to delete auth user" };
  }
}