import "server-only";

import { cache } from "react";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";
import type { HeroBanner } from "@ordersync/types";

/**
 * Fetch active banners from Firestore on the server, ordered by sortOrder.
 *
 * Mirrors the client `fetchBanners` endpoint but runs server-side so the
 * hero section can stream with the page instead of waiting for a
 * client-side RTK Query fetch after hydration. React `cache` dedupes
 * repeat calls within a request; results are JSON-sanitized for safe
 * serialization across the RSC boundary.
 */
export const getBanners = cache(async (): Promise<HeroBanner[]> => {
  try {
    const app = await initAdmin();
    const db = getFirestore(app);
    const snapshot = await db
      .collection("banners")
      .where("active", "==", true)
      .orderBy("sortOrder", "asc")
      .get();
    return snapshot.docs.map((doc) =>
      JSON.parse(JSON.stringify({ id: doc.id, ...doc.data() }))
    ) as HeroBanner[];
  } catch (error) {
    console.error("[getBanners] Failed to fetch banners:", error);
    return [];
  }
});
