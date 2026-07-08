"use server";

import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function getUserProvider(uid: string): Promise<{
  provider: string | null;
  error?: string;
}> {
  try {
    if (!uid) {
      return { provider: null, error: "User UID is required." };
    }

    const app = await initAdmin();
    const auth = getAuth(app);
    const userRecord = await auth.getUser(uid);

    const providerId = userRecord.providerData?.[0]?.providerId;
    if (providerId) {
      return { provider: providerId };
    }

    return { provider: null, error: "No provider data found for this user" };
  } catch (error: unknown) {
    console.error("Error fetching user provider:", error);
    return { provider: null, error: "Failed to fetch user provider" };
  }
}
