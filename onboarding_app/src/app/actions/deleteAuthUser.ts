"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Permanently deletes a Firebase Auth user.
 *
 * Authorization is verified from the caller's ID token (never trusted from
 * client-supplied uids). Only a partner (BUSINESSES_CREATOR, verified via
 * Firestore) may delete auth users. The target must not be the caller themself
 * (a partner cannot delete their own account through this action).
 */
export async function deleteAuthUser(
  targetUid: string,
  idToken: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!targetUid || !idToken) {
      return { success: false, error: "User UID and caller ID token are required." };
    }

    const app = await initAdmin();
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Verify the caller from their ID token.
    let callerUid: string;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      callerUid = decoded.uid;
    } catch {
      return { success: false, error: "Unauthorized: invalid caller token." };
    }

    if (callerUid === targetUid) {
      return { success: false, error: "Unauthorized: cannot delete your own account." };
    }

    // Only partners may delete other auth users.
    const callerDoc = await db.collection("users").doc(callerUid).get();
    const callerData = callerDoc.data();
    if (!callerDoc.exists || callerData?.userInfo?.role !== "BUSINESSES_CREATOR") {
      return {
        success: false,
        error: "Unauthorized: only business creators can delete users.",
      };
    }

    await auth.deleteUser(targetUid);

    console.log("Server Action [deleteAuthUser]: Deleted auth user", targetUid, "(by partner:", callerUid + ")");
    return { success: true };
  } catch (error: unknown) {
    // If user not found in Auth, consider it a success (already deleted)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "auth/user-not-found"
    ) {
      console.log("Server Action [deleteAuthUser]: Auth user not found, skipping", targetUid);
      return { success: true };
    }

    console.error("Error deleting auth user:", error);
    return { success: false, error: "Failed to delete auth user" };
  }
}
