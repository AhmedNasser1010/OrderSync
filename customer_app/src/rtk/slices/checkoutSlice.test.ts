import { describe, it, expect } from "vitest";
import reducer, {
  clearCheckout,
  addCheckout,
  addToUserLocation,
} from "./checkoutSlice";

describe("checkoutSlice", () => {
  it("returns the initial state", () => {
    const state = reducer(undefined, { type: "unknown" });
    expect(state).toMatchObject({
      comment: "",
      user: { name: null, phone: null, secondPhone: null },
      location: { latlng: [null, null], address: "" },
      payment: { method: "CASH" },
    });
  });

  it("merges partial payloads with addCheckout", () => {
    const state = reducer(
      undefined,
      addCheckout({ comment: "no onions", payment: { method: "CASH" } })
    );
    expect(state.comment).toBe("no onions");
    expect(state.payment.method).toBe("CASH");
    expect(state.user.name).toBeNull();
  });

  it("updates location fields with addToUserLocation", () => {
    let state = reducer(
      undefined,
      addToUserLocation({ latlng: [30, 31], address: "Home" })
    );
    expect(state.location).toEqual({ latlng: [30, 31], address: "Home" });
    state = reducer(state, addToUserLocation({ address: "Work" }));
    expect(state.location.latlng).toEqual([30, 31]);
    expect(state.location.address).toBe("Work");
  });

  it("resets everything with clearCheckout", () => {
    const state = reducer(
      undefined,
      addCheckout({ comment: "extra spicy", payment: { method: "CASH" } })
    );
    const cleared = reducer(state, clearCheckout());
    expect(cleared).toEqual({
      comment: "",
      user: { name: null, phone: null, secondPhone: null },
      location: { latlng: [null, null], address: "" },
      payment: { method: "CASH" },
    });
  });
});
