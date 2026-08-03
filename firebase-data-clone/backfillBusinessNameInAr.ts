import { productionDb } from "./firebaseAdmin";

const BATCH_SIZE = 500;

async function backfill() {
  console.log("Starting backfill of business.nameInAr on orders...");

  const businessNameCache = new Map<string, string | null>();

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
      const businessId = order.business?.id;

      if (!businessId) continue;

      // Skip if nameInAr already exists on the order
      if (order.business?.nameInAr) continue;

      // Resolve Arabic name from cache or fetch it
      let nameInAr = businessNameCache.get(businessId);
      if (nameInAr === undefined) {
        const businessSnap = await productionDb
          .collection("businesses")
          .select("profile.nameInAr")
          .where("__name__", "==", businessId)
          .get()
          .then((s) => s.docs[0]);

        if (businessSnap?.exists) {
          const data = businessSnap.data();
          nameInAr = (data?.profile?.nameInAr as string | undefined) ?? null;
        } else {
          nameInAr = null;
        }
        businessNameCache.set(businessId, nameInAr);
      }

      if (nameInAr) {
        batch.update(doc.ref, { "business.nameInAr": nameInAr });
        batchUpdatedCount++;
      }
    }

    if (batchUpdatedCount > 0) {
      await batch.commit();
      updatedCount += batchUpdatedCount;
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    console.log(
      `Processed ${processedCount} orders, updated ${updatedCount} so far (${businessNameCache.size} unique businesses cached)`,
    );
  }

  console.log(`\nDone! Processed ${processedCount} orders, updated ${updatedCount} orders.`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
