"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const VALID_ROLES = [
  "BUSINESSES_CREATOR",
  "BUSINESS_MANAGER",
  "DRIVER",
] as const;

const DRIVER_ROLE = "DRIVER" as const;

/**
 * Returns the existing conflicting role for the given email, if any, that
 * must not be combined with the requested role. Business creators/managers
 * must not also be drivers (and vice-versa). Customers may share an email.
 */
async function findConflictingRole(
  db: Firestore,
  email: string,
  requestedRole: string,
): Promise<string | null> {
  const lower = email.toLowerCase();

  const staffSnap = await db
    .collection("users")
    .select("userInfo")
    .where("userInfo.email", "==", lower)
    .limit(10)
    .get();

  const driverSnap = await db
    .collection("drivers")
    .select("userInfo")
    .where("userInfo.email", "==", lower)
    .limit(10)
    .get();

  const hasStaff =
    staffSnap.docs.length > 0 &&
    staffSnap.docs.some((d) => {
      const role = d.data()?.userInfo?.role;
      return role === "BUSINESSES_CREATOR" || role === "BUSINESS_MANAGER";
    });
  const hasDriver = driverSnap.docs.length > 0;

  if (requestedRole === DRIVER_ROLE && hasStaff) {
    return "business creator or manager";
  }
  if (requestedRole !== DRIVER_ROLE && hasDriver) {
    return "driver";
  }
  return null;
}

/**
 * Assigns a role custom claim to a Firebase Auth user.
 *
 * The caller's identity is cryptographically verified from their Firebase
 * ID token (never trusted from client-supplied uids). Rules:
 *  - A user may assign a role to THEMSELVES (self-signup).
 *  - A partner (BUSINESSES_CREATOR, verified via Firestore) may assign a role
 *    to ANOTHER user (e.g. creating a manager or driver).
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

    // Verify the caller from their ID token.
    let callerUid: string;
    try {
      const decoded = await auth.verifyIdToken(idToken);
      callerUid = decoded.uid;
    } catch {
      return { success: false, error: "Unauthorized: invalid caller token." };
    }

    if (callerUid !== targetUid) {
      // Assigning a role to another user requires partner privileges.
      const callerDoc = await db.collection("users").doc(callerUid).get();
      const callerData = callerDoc.data();
      if (
        !callerDoc.exists ||
        callerData?.userInfo?.role !== "BUSINESSES_CREATOR"
      ) {
        return {
          success: false,
          error:
            "Unauthorized: only business creators can assign roles to other users.",
        };
      }
    }

    // Enforce "one Auth UID = one role". A user account must not hold multiple
    // roles (customer, business staff, or driver) at the same time — each role
    // requires a separate Firebase Auth account. This is the decisive check
    // that prevents a Google account which signed up as a customer from being
    // silently promoted to a business creator/manager/driver.
    const existingClaimRole = (await auth.getUser(targetUid)).customClaims?.role;
    if (existingClaimRole && existingClaimRole !== role) {
      return {
        success: false,
        error: "This account already has a role and cannot be assigned another one.",
      };
    }

    const [staffDoc, driverDoc, customerDoc] = await Promise.all([
      db.collection("users").doc(targetUid).get(),
      db.collection("drivers").doc(targetUid).get(),
      db.collection("customers").doc(targetUid).get(),
    ]);

    const staffRole = staffDoc.data()?.userInfo?.role;
    if (staffDoc.exists && staffRole && staffRole !== role) {
      return {
        success: false,
        error: "This account is already a business user and cannot be assigned another role.",
      };
    }
    if (driverDoc.exists && role !== "DRIVER") {
      return {
        success: false,
        error: "This account is already a driver and cannot be assigned another role.",
      };
    }
    if (customerDoc.exists && role !== "CUSTOMER") {
      return {
        success: false,
        error:
          "This account is already registered as a customer. Each role requires a separate account — use a different email to create a business account.",
      };
    }

    // Prevent the same email from holding conflicting high-privilege roles
    // (business creator/manager vs driver). A customer can share an email with
    // these roles, but a single email must not be both staff and a driver.
    const targetEmail = (await auth.getUser(targetUid)).email;
    if (targetEmail) {
      const conflict = await findConflictingRole(db, targetEmail, role);
      if (conflict) {
        return {
          success: false,
          error: `This email is already registered as a ${conflict}. A user cannot hold conflicting roles.`,
        };
      }
    }

    await auth.setCustomUserClaims(targetUid, { role });

    console.log(
      "Server Action [setUserRoleClaim]: Set role claim",
      role,
      "for user",
      targetUid,
      callerUid === targetUid ? "(self)" : `(by partner: ${callerUid})`,
    );
    return { success: true };
  } catch (error: unknown) {
    console.error("Error setting user role claim:", error);
    return { success: false, error: "Failed to set role claim" };
  }
}
