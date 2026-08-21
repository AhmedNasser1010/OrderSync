import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateReorder } from "./reorder";
import type { ItemType } from "@ordersync/types";
import type { RestaurantDocument } from "@/types/restaurant";

vi.mock("@/utils/workingDaysChecker", () => ({
  default: vi.fn(() => true),
}));

import workingDaysChecker from "@/utils/workingDaysChecker";

const mockWorkingDaysChecker = vi.mocked(workingDaysChecker);

const restaurant = {
  accessToken: "res-1",
  status: "active",
  operations: {
    openingHours: {},
    cookTime: [10, 20],
    paymentMethods: { cash: true },
  },
  profile: { name: "Test Restaurant", nameInAr: "مطعم" },
} as unknown as RestaurantDocument;

const burger: ItemType = {
  id: "item-1",
  title: "Burger",
  price: 50,
  topMenu: false,
  visibility: true,
  category: "cat-1",
  backgrounds: [],
  createdAt: 1,
  updatedAt: 1,
};

const pizza: ItemType = {
  ...burger,
  id: "item-2",
  title: "Pizza",
  sizes: [
    { size: "Small", price: "80" },
    { size: "Large", price: "120" },
  ],
};

const menuItems = [burger, pizza];

const order = {
  businessId: "res-1",
  cart: [
    { id: "item-1", quantity: 2, selectedSize: null },
    { id: "item-2", quantity: 1, selectedSize: "Large" },
  ],
};

describe("validateReorder", () => {
  beforeEach(() => {
    mockWorkingDaysChecker.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes when all items and sizes still exist and the restaurant is open", () => {
    expect(validateReorder(order, [restaurant], menuItems)).toEqual({ ok: true });
  });

  it("fails with restaurant-unavailable when the restaurant is not found", () => {
    expect(validateReorder(order, [], menuItems)).toEqual({
      ok: false,
      reason: "restaurant-unavailable",
    });
  });

  it.each(["inactive", "pause", "hidden"] as const)(
    "fails with restaurant-closed when status is %s",
    (status) => {
      expect(
        validateReorder(order, [{ ...restaurant, status }], menuItems)
      ).toEqual({ ok: false, reason: "restaurant-closed" });
    }
  );

  it("fails with restaurant-closed when working hours say closed", () => {
    mockWorkingDaysChecker.mockReturnValue(false);
    expect(validateReorder(order, [restaurant], menuItems)).toEqual({
      ok: false,
      reason: "restaurant-closed",
    });
  });

  it("allows the busy status", () => {
    expect(
      validateReorder(order, [{ ...restaurant, status: "busy" }], menuItems)
    ).toEqual({ ok: true });
  });

  it("fails with items-changed when an item was removed from the menu", () => {
    expect(
      validateReorder(order, [restaurant], [pizza])
    ).toEqual({ ok: false, reason: "items-changed" });
  });

  it("fails with items-changed when an item is hidden from the menu", () => {
    expect(
      validateReorder(order, [restaurant], [{ ...burger, visibility: false }, pizza])
    ).toEqual({ ok: false, reason: "items-changed" });
  });

  it("fails with items-changed when a selected size no longer exists", () => {
    expect(
      validateReorder(
        order,
        [restaurant],
        [burger, { ...pizza, sizes: [{ size: "Small", price: "80" }] }]
      )
    ).toEqual({ ok: false, reason: "items-changed" });
  });

  it("fails with items-changed when a previously unsized item now requires a size", () => {
    expect(
      validateReorder(order, [restaurant], [{ ...burger, sizes: [{ size: "Small", price: "60" }] }, pizza])
    ).toEqual({ ok: false, reason: "items-changed" });
  });
});
