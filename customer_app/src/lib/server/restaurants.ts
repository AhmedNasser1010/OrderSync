import "server-only";

import { cache } from "react";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";
import type { BusinessDocument } from "@ordersync/types";

/**
 * Fetch all business documents from Firestore on the server.
 *
 * Wrapped in React `cache` so multiple sections on the homepage share a
 * single Firestore read per request. The result is JSON-sanitized so it is
 * safely serializable across the RSC boundary (Firestore Timestamps and
 * other class instances are converted to plain values).
 */
export const getBusinesses = cache(
  async (): Promise<BusinessDocument[]> => {
    try {
      const app = await initAdmin();
      const db = getFirestore(app);
      const snapshot = await db.collection("businesses").get();
      return snapshot.docs.map((doc) =>
        JSON.parse(JSON.stringify({ id: doc.id, ...doc.data() }))
      ) as BusinessDocument[];
    } catch (error) {
      console.error("[getBusinesses] Failed to fetch businesses:", error);
      return [];
    }
  }
);
