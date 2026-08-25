import { productionDb } from "./firebaseAdmin";

const BATCH_SIZE = 500;

const TERMINAL_STATUSES = new Set([
  "DELIVERED",
  "GIVEN_FEEDBACK",
  "CANCELED",
  "REJECTED",
  "VOIDED",
]);

async function isMarketplaceHidden(businessId: string): Promise<boolean> {
  const snap = await productionDb.collection("businesses").doc(businessId).get();
  if (!snap.exists) return false;
  const settings = snap.data()?.settings ?? {};
  return settings.hideFromMarketplace === true;
}

async function backfill() {
  console.log("Starting backfill of marketplaceHidden on active orders...");

  const businessCache = new Map<string, boolean>();

  let processedCount = 0;
  let updatedCount = 0;
  let lastDoc: FirebaseFirestore.DocumentSnapshot | undefined;

  while (true) {
    let query = productionDb
      .collection("orders")
      .orderBy("__name__")
      .limit(BATCH_SIZE);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    if (snapshot.empty) break;

    const batch = productionDb.batch();
    let batchUpdatedCount = 0;

    for (const doc of snapshot.docs) {
      processedCount++;
      const order = doc.data();

      // Terminal orders are never shown to drivers; no need to stamp them.
      if (TERMINAL_STATUSES.has(order.status?.current)) continue;

      // Only write when hiding; absent field is treated as visible by queries.
      if (order.marketplaceHidden === true) continue;

      const businessId = order.businessId || order.business?.id;
      if (!businessId) continue;

      let hidden = businessCache.get(businessId);
      if (hidden === undefined) {
        hidden = await isMarketplaceHidden(businessId);
        businessCache.set(businessId, hidden);
      }

      if (hidden) {
        batch.update(doc.ref, { marketplaceHidden: true });
        batchUpdatedCount++;
      }
    }

    if (batchUpdatedCount > 0) {
      await batch.commit();
      updatedCount += batchUpdatedCount;
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    console.log(
      `Processed ${processedCount} orders, updated ${updatedCount} so far (${businessCache.size} unique businesses cached)`,
    );
  }

  console.log(`\nDone! Processed ${processedCount} orders, updated ${updatedCount} orders.`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
