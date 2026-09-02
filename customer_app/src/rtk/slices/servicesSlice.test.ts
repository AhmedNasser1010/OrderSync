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
      minOrder: 50,
    };
    expect(reducer(undefined, initServices(services))).toEqual(services);
  });

  it("stores the maintenance flag", () => {
    const services = {
      deliveryFees: 10,
      maintenance: { enabled: true, message: "We'll be back", eta: "Sep 5" },
    };
    expect(reducer(undefined, initServices(services)).maintenance).toEqual(
      services.maintenance
    );
  });

  it("stores a cleared maintenance message as null", () => {
    const services = {
      maintenance: { enabled: true, message: null, eta: null },
    };
    expect(reducer(undefined, initServices(services)).maintenance).toEqual(
      services.maintenance
    );
  });

  it("clears services", () => {
    const state = reducer(undefined, initServices({ deliveryFees: 10 }));
    expect(reducer(state, clearServices())).toEqual({});
  });
});
