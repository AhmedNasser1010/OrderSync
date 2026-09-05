import { describe, it, expect } from "vitest";
import { isMarketplaceRestaurant } from "./marketplaceRestaurant";
import type { BusinessDocument } from "@ordersync/types";

const res = (name: string): BusinessDocument =>
  ({
    id: name,
    accessToken: "token-" + name,
    profile: { name: name, nameInAr: name },
    status: "active",
  }) as unknown as BusinessDocument;

describe("isMarketplaceRestaurant", () => {
  it("excludes names starting with 'Test'", () => {
    expect(isMarketplaceRestaurant(res("Test Restaurant"))).toBe(false);
  });

  it("excludes case-insensitive variants", () => {
    expect(isMarketplaceRestaurant(res("test cafe"))).toBe(false);
    expect(isMarketplaceRestaurant(res("TEST PIZZA"))).toBe(false);
  });

  it("keeps normal restaurants", () => {
    expect(isMarketplaceRestaurant(res("Al-Ayat Grill"))).toBe(true);
  });

  it("keeps names that merely contain 'Test'", () => {
    expect(isMarketplaceRestaurant(res("The Latest Eatery"))).toBe(true);
  });
});