"use server";

import { getUserUidByEmail } from "@/lib/firebase-admin";

export async function getUserUid(email: string): Promise<{
  uid: string | null;
  error?: string;
}> {
  try {
    const uid = await getUserUidByEmail(email);
    return { uid };
  } catch (error) {
    console.error("Error fetching user UID:", error);
    return { uid: null, error: "Failed to fetch user UID" };
  }
}