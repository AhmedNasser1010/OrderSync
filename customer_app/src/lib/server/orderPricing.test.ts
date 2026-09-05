import { describe, it, expect } from "vitest";
import {
  computeServerPricing,
  OrderValidationError,
  type ServerPricingInput,
} from "./orderPricing";
import type { MainMenuType } from "@ordersync/types";
import type { DiscountObject } from "@ordersync/types";

const RES_ID = "res-123";
const RESTAURANT_LATLNG: [number, number] = [30, 31];
const DELIVERY_LATLNG: [number, number] = [30, 31];

const NOW = 1_700_000_000_000;

function buildMenu(overrides?: Partial<MainMenuType>): MainMenuType {
  const category = {
    id: "cat-1",
    title: "Main",
    topMenu: true,
    visibility: true,
    createdAt: NOW,
    updatedAt: NOW,
  };
  const menu: MainMenuType = {
    accessToken: RES_ID,
    partnerUid: "partner-1",
    createdAt: NOW,
    updatedAt: NOW,
    categories: [category],
    items: [
      {
        id: "item-1",
        title: "Burger",
        price: 100,
        topMenu: true,
        visibility: true,
        category: "cat-1",
        backgrounds: [],
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "item-2",
        title: "Pizza",
        price: 50,
        topMenu: false,
        visibility: true,
        category: "cat-1",
        backgrounds: [],
        sizes: [
          { size: "Small", price: "40" },
          { size: "Large", price: "60" },
        ],
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "item-hidden",
        title: "Hidden",
        price: 30,
        topMenu: false,
        visibility: false,
        category: "cat-1",
        backgrounds: [],
        createdAt: NOW,
        updatedAt: NOW,
      },
      {
        id: "item-discount",
        title: "Discounted",
        price: 100,
        topMenu: false,
        visibility: true,
        category: "cat-1",
        backgrounds: [],
        discount: {
          id: "d-item",
          code: "ITEM20",
          message: "20 off",
          level: "item",
          type: "FIXED",
          value: 20,
          conditions: { operator: "AND", rules: [] },
          active: true,
        },
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
    ...overrides,
  };
  return menu;
}

function input(overrides?: Partial<ServerPricingInput>): ServerPricingInput {
  return {
    menu: buildMenu(),
    cart: [{ id: "item-1", quantity: 2 }],
    user: {},
    resId: RES_ID,
    deliveryLatLng: DELIVERY_LATLNG,
    restaurantLatLng: RESTAURANT_LATLNG,
    ...overrides,
  };
}

describe("computeServerPricing", () => {
  it("computes subtotal + minimum delivery fee for a simple cart", () => {
    const result = computeServerPricing(input());
    expect(result.pricing).toEqual({
      subtotal: 200,
      discount: 0,
      deliveryFees: 5,
      total: 205,
    });
    expect(result.lines).toEqual([
      { id: "item-1", name: "Burger", quantity: 2, selectedSize: null },
    ]);
  });

  it("uses the selected size price", () => {
    const result = computeServerPricing(
      input({
        cart: [{ id: "item-2", quantity: 1, selectedSize: "Large" }],
      })
    );
    expect(result.pricing.subtotal).toBe(60);
    expect(result.pricing.total).toBe(65);
  });

  it("rejects an empty cart", () => {
    expect(() => computeServerPricing(input({ cart: [] }))).toThrowError(
      OrderValidationError
    );
    expect(() => computeServerPricing(input({ cart: [] }))).toThrowError(
      /Cart is empty/
    );
  });

  it("rejects invalid quantities", () => {
    expect(() =>
      computeServerPricing(input({ cart: [{ id: "item-1", quantity: 0 }] }))
    ).toThrowError(OrderValidationError);
    expect(() =>
      computeServerPricing(
        input({ cart: [{ id: "item-1", quantity: 1.5 }] })
      )
    ).toThrowError(OrderValidationError);
  });

  it("rejects an unknown item", () => {
    expect(() =>
      computeServerPricing(
        input({ cart: [{ id: "missing-item", quantity: 1 }] })
      )
    ).toThrowError(OrderValidationError);
  });

  it("rejects a hidden item", () => {
    expect(() =>
      computeServerPricing(
        input({ cart: [{ id: "item-hidden", quantity: 1 }] })
      )
    ).toThrowError(OrderValidationError);
  });

  it("rejects an item in a hidden category", () => {
    const menu = buildMenu({
      categories: [
        {
          id: "cat-1",
          title: "Main",
          topMenu: true,
          visibility: false,
          createdAt: NOW,
          updatedAt: NOW,
        },
      ],
    });
    expect(() =>
      computeServerPricing(
        input({
          menu,
          cart: [{ id: "item-1", quantity: 1 }],
        })
      )
    ).toThrowError(OrderValidationError);
  });

  it("rejects an invalid size", () => {
    expect(() =>
      computeServerPricing(
        input({ cart: [{ id: "item-2", quantity: 1, selectedSize: "XXL" }] })
      )
    ).toThrowError(OrderValidationError);
  });

  it("applies an item-level fixed discount", () => {
    const result = computeServerPricing(
      input({ cart: [{ id: "item-discount", quantity: 1 }] })
    );
    expect(result.pricing).toEqual({
      subtotal: 100,
      discount: 20,
      deliveryFees: 5,
      total: 85,
    });
  });

  it("applies an order-level percentage discount", () => {
    const menu = buildMenu({
      orderDiscounts: [
        {
          id: "d-order",
          code: "SUMMER10",
          message: "10% off",
          level: "order",
          type: "P",
          value: 10,
          conditions: { operator: "AND", rules: [] },
          active: true,
        },
      ],
    });
    const result = computeServerPricing(input({ menu }));
    expect(result.pricing).toMatchObject({
      subtotal: 200,
      discount: 20,
      deliveryFees: 5,
      total: 185,
      promoCode: "SUMMER10",
      promoDiscount: 20,
    });
  });

  it("applies an order-level fixed discount", () => {
    const menu = buildMenu({
      orderDiscounts: [
        {
          id: "d-order",
          code: "FIXED30",
          message: "30 off",
          level: "order",
          type: "FIXED",
          value: 30,
          conditions: { operator: "AND", rules: [] },
          active: true,
        },
      ],
    });
    const result = computeServerPricing(input({ menu }));
    expect(result.pricing).toMatchObject({
      subtotal: 200,
      discount: 30,
      deliveryFees: 5,
      total: 175,
      promoCode: "FIXED30",
      promoDiscount: 30,
    });
  });

  it("includes promoDiscount for an order-level discount without a code", () => {
    // The client (usePlace) sends promoDiscount whenever an order discount is
    // eligible, even if the discount has no `code`. The server must mirror
    // that, otherwise pricingMatches() rejects the order with PRICE_MISMATCH.
    const menu = buildMenu({
      orderDiscounts: [
        {
          id: "d-order",
          code: "",
          message: "auto 10% off",
          level: "order",
          type: "P",
          value: 10,
          conditions: { operator: "AND", rules: [] },
          active: true,
        } as DiscountObject,
      ],
    });
    const result = computeServerPricing(input({ menu }));
    expect(result.pricing).toMatchObject({
      subtotal: 200,
      discount: 20,
      deliveryFees: 5,
      total: 185,
      promoDiscount: 20,
    });
    expect(result.pricing.promoCode).toBe("");
  });

  it("caps the order discount at the subtotal", () => {
    const menu = buildMenu({
      orderDiscounts: [
        {
          id: "d-order",
          code: "BIG",
          message: "500 off",
          level: "order",
          type: "FIXED",
          value: 500,
          conditions: { operator: "AND", rules: [] },
          active: true,
        },
      ],
    });
    const result = computeServerPricing(input({ menu }));
    expect(result.pricing.total).toBe(5); // only delivery fee remains
  });

  it("honors the delivery fee configuration", () => {
    const result = computeServerPricing(
      input({ deliveryFeesConfig: { perKm: 10, min: 50 } })
    );
    expect(result.pricing.deliveryFees).toBe(50);
  });

  it("computes delivery fees from the real distance", () => {
    const result = computeServerPricing(
      input({
        deliveryLatLng: [30.02, 31],
        restaurantLatLng: [30, 31],
      })
    );
    // 0.02° latitude ≈ 2.22 km × 3.5 perKm ≈ 7.8 → rounds to 8.
    expect(result.pricing.deliveryFees).toBe(8);
  });

  it("sets the OrderValidationError code", () => {
    try {
      computeServerPricing(input({ cart: [] }));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(OrderValidationError);
      expect((error as OrderValidationError).code).toBe("INVALID_ORDER_PAYLOAD");
    }
  });
});
