import type { BusinessDocument } from "@ordersync/types";

/**
 * Test restaurants (English name starting with "Test", case-insensitive) are
 * hidden from all marketplace/listing surfaces but remain reachable on their
 * menu page via a direct URL (the menu page resolves from a separate
 * client-side fetch, not from the server marketplace helper).
 */
export const isMarketplaceRestaurant = (b: BusinessDocument): boolean =>
  !b.profile?.name?.toLowerCase().startsWith("test");