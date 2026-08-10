import { describe, it, expect } from "vitest";
import reducer, {
  initOrder,
  initDriver,
  initRes,
  trackingReset,
  clearDriver,
} from "./trackingSlice";

describe("trackingSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      order: null,
      driver: null,
      res: null,
    });
  });

  it("initializes order, driver and res", () => {
    let state = reducer(undefined, initOrder({ id: "order-1" }));
    state = reducer(state, initDriver({ uid: "driver-1" }));
    state = reducer(state, initRes({ id: "res-1" }));
    expect(state.order).toEqual({ id: "order-1" });
    expect(state.driver).toEqual({ uid: "driver-1" });
    expect(state.res).toEqual({ id: "res-1" });
  });

  it("clears each entity independently", () => {
    let state = reducer(undefined, initOrder({ id: "o" }));
    state = reducer(state, initDriver({ uid: "d" }));
    state = reducer(state, initRes({ id: "r" }));
    state = reducer(state, clearDriver());
    expect(state.driver).toBeNull();
    expect(state.order).toEqual({ id: "o" });
    expect(state.res).toEqual({ id: "r" });
  });

  it("resets everything", () => {
    let state = reducer(undefined, initOrder({ id: "o" }));
    state = reducer(state, initDriver({ uid: "d" }));
    state = reducer(state, initRes({ id: "r" }));
    expect(reducer(state, trackingReset())).toEqual({
      order: null,
      driver: null,
      res: null,
    });
  });
});
