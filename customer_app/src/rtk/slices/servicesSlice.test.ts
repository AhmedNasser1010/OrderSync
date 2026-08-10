import { describe, it, expect } from "vitest";
import reducer, { initServices, clearServices } from "./servicesSlice";

describe("servicesSlice", () => {
  it("starts as an empty object", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({});
  });

  it("initializes services", () => {
    const services = {
      deliveryFees: 10,
      minDeliveryFees: 5,
      commissionPercent: 15,
      minOrder: 50,
    };
    expect(reducer(undefined, initServices(services))).toEqual(services);
  });

  it("clears services", () => {
    const state = reducer(undefined, initServices({ deliveryFees: 10 }));
    expect(reducer(state, clearServices())).toEqual({});
  });
});
