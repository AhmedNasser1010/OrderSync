import { productionDb } from "./firebaseAdmin";

const BATCH_SIZE = 500;

interface DiscountObject {
  active?: boolean;
  startAt?: number | null;
  expireAt?: number | null;
}

interface MenuItem {
  visibility?: boolean;
  discount?: DiscountObject;
}

interface MenuCategory {
  visibility?: boolean;
  discount?: DiscountObject;
}

interface MenuData {
  items?: MenuItem[];
  categories?: MenuCategory[];
  orderDiscounts?: DiscountObject[];
}

function isDiscountActive(discount: DiscountObject | undefined): boolean {
  if (!discount || !discount.active) return false;

  const now = Date.now();
  if (discount.startAt && now < discount.startAt) return false;
  if (discount.expireAt && now > discount.expireAt) return false;

  return true;
}

function menuHasOffers(menu: MenuData | undefined): boolean {
  if (!menu) return false;

  const items = Array.isArray(menu.items) ? menu.items : [];
  const categories = Array.isArray(menu.categories) ? menu.categories : [];
  const orderDiscounts = Array.isArray(menu.orderDiscounts)
    ? menu.orderDiscounts
    : [];

  if (
    items.some((item) => item.visibility && isDiscountActive(item.discount))
  ) {
    return true;
  }

  if (
    categories.some(
      (category) =>
        category.visibility && isDiscountActive(category.discount),
    )
  ) {
    return true;
  }

  if (orderDiscounts.some(isDiscountActive)) {
    return true;
  }

  return false;
}

async function backfill() {
  console.log("Starting backfill of business.hasOffers...");

  let processedCount = 0;
  let updatedCount = 0;
  let lastDoc: FirebaseFirestore.DocumentSnapshot | undefined;

  while (true) {
    let query = productionDb
      .collection("businesses")
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
      const businessId = doc.id;

      const menuSnapshot = await productionDb
        .collection("menus")
        .doc(businessId)
        .get();

      const hasOffers = menuHasOffers(menuSnapshot.exists
        ? (menuSnapshot.data() as MenuData)
        : undefined);

      batch.update(doc.ref, { hasOffers });
      batchUpdatedCount++;
    }

    await batch.commit();
    updatedCount += batchUpdatedCount;

    lastDoc = snapshot.docs[snapshot.docs.length - 1];

    console.log(
      `Processed ${processedCount} businesses, updated ${updatedCount} so far`,
    );
  }

  console.log(
    `\nDone! Processed ${processedCount} businesses, updated ${updatedCount} with hasOffers.`,
  );
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
