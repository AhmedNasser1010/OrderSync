"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const VALID_ROLES = ["DRIVER"] as const;

/**
 * Assigns the DRIVER role to the caller's own Firebase Auth user during
 * signup. The caller is cryptographically verified from their ID token and
 * must match the target uid — cross-user role assignment is not allowed from
 * this app.
 */
export async function setUserRoleClaim(
  targetUid: string,
  role: string,
  idToken: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!targetUid || !role || !idToken) {
      return {
        success: false,
        error: "Target UID, role and caller ID token are required.",
      };
    }

    if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
      return { success: false, error: "Invalid role." };
    }

    const app = await initAdmin();
    const auth = getAuth(app);
    const db = getFirestore(app);

    let callerUid: string;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      callerUid = decoded.uid;
    } catch {
      return { success: false, error: "Unauthorized: invalid caller token." };
    }

    if (callerUid !== targetUid) {
      return {
        success: false,
        error: "Unauthorized: cannot assign roles to other users.",
      };
    }

    // Enforce "one Auth UID = one role": an account that already exists as a
    // customer or business staff cannot become a driver.
    const [staffDoc, customerDoc] = await Promise.all([
      db.collection("users").doc(targetUid).get(),
      db.collection("customers").doc(targetUid).get(),
    ]);
    if (staffDoc.exists) {
      return {
        success: false,
        error: "This account is already a business user and cannot be assigned another role.",
      };
    }
    if (customerDoc.exists) {
      return {
        success: false,
        error:
          "This account is already registered as a customer. Each role requires a separate account — use a different email to create a driver account.",
      };
    }

    // Prevent a driver from also being a business creator or manager (staff).
    const targetEmail = (await auth.getUser(targetUid)).email;
    if (targetEmail) {
      const staffSnap = await db
        .collection("users")
        .select("userInfo")
        .where("userInfo.email", "==", targetEmail.toLowerCase())
        .limit(10)
        .get();
      const hasStaff = staffSnap.docs.some((d) => {
        const role = d.data()?.userInfo?.role;
        return role === "BUSINESSES_CREATOR" || role === "BUSINESS_MANAGER";
      });
      if (hasStaff) {
        return {
          success: false,
          error:
            "This email is already registered as a business creator or manager. A user cannot hold conflicting roles.",
        };
      }
    }

    await auth.setCustomUserClaims(targetUid, { role });

    console.log(
      "Server Action [setUserRoleClaim]: Set role claim",
      role,
      "for user",
      targetUid,
      "(self)",
    );
    return { success: true };
  } catch (error: unknown) {
    console.error("Error setting user role claim:", error);
    return { success: false, error: "Failed to set role claim" };
  }
}
