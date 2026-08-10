import { describe, it, expect } from "vitest";
import orderYupSchema from "./orderYupSchema";

const validOrder = {
  customerUid: "cust-1",
  business: {
    id: "res-1",
    name: "Test Restaurant",
    nameInAr: "مطعم",
    phone: "+201000000000",
    address: "El Ayat",
    latlng: [30, 31],
  },
  assignment: { driverUid: null },
  delivery: { address: "Home", latlng: [30.01, 31.01], note: "ring bell" },
  cart: [{ id: "item-1", name: "Burger", quantity: 2, selectedSize: null, discountCode: null }],
  pricing: { subtotal: 200, discount: 0, deliveryFees: 5, total: 205 },
  payment: { method: "CASH", status: "COMPLETED" },
  finance: {
    commissionPercent: 10,
    commissionAmount: 20,
    restaurantShare: 180,
    companyShare: 20,
    cashCollected: 205,
    driverEarnings: 5,
  },
  reconciliation: { settlementId: null, restaurantPaid: false },
  notes: { order: null },
  metadata: { orderSource: "pc_chrome", cancelAutoAssign: false },
  customer: {
    uid: "cust-1",
    name: "Nasser",
    phone: "+201000000000",
    secondPhone: null,
    firstOrderDate: 1_700_000_000_000,
    totalOrders: 1,
    totalOrdersValue: 205,
  },
};

describe("orderYupSchema", () => {
  it("passes a fully valid order payload", async () => {
    const value = await orderYupSchema.validate(validOrder, {
      abortEarly: false,
    });
    expect(value.customerUid).toBe("cust-1");
  });

  it("fails when the cart is empty", async () => {
    await expect(
      orderYupSchema.validate({ ...validOrder, cart: [] }, { abortEarly: false })
    ).rejects.toThrow();
  });

  it("fails when a cart item has quantity 0", async () => {
    await expect(
      orderYupSchema.validate(
        {
          ...validOrder,
          cart: [{ id: "item-1", name: "Burger", quantity: 0 }],
        },
        { abortEarly: false }
      )
    ).rejects.toThrow();
  });

  it("fails when customerUid is missing", async () => {
    const rest = { ...validOrder };
    delete rest.customerUid;
    await expect(
      orderYupSchema.validate(rest, { abortEarly: false })
    ).rejects.toThrow();
  });

  it("fails when delivery latlng has fewer than 2 entries", async () => {
    await expect(
      orderYupSchema.validate(
        {
          ...validOrder,
          delivery: { ...validOrder.delivery, latlng: [30] },
        },
        { abortEarly: false }
      )
    ).rejects.toThrow();
  });

  it("fails for an unsupported payment method", async () => {
    await expect(
      orderYupSchema.validate(
        {
          ...validOrder,
          payment: { method: "VISA", status: "COMPLETED" },
        },
        { abortEarly: false }
      )
    ).rejects.toThrow();
  });

  it("fails when pricing totals are negative", async () => {
    await expect(
      orderYupSchema.validate(
        { ...validOrder, pricing: { ...validOrder.pricing, total: -5 } },
        { abortEarly: false }
      )
    ).rejects.toThrow();
  });
});
