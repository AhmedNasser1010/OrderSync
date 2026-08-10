import { describe, it, expect } from "vitest";
import reducer, { initRestaurants, clearRestaurants } from "./restaurantsSlice";
import type { BusinessDocument } from "@ordersync/types";

const res = (id: string, status = "active"): BusinessDocument => ({
  id,
  accessToken: id,
  name: `Restaurant ${id}`,
  nameInAr: `مطعم ${id}`,
  phone: "+201000000000",
  latlng: [30, 31],
  status,
  address: "El Ayat",
});

describe("restaurantsSlice", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual([]);
  });

  it("filters out hidden restaurants on init", () => {
    const state = reducer(
      undefined,
      initRestaurants([res("a"), res("b", "hidden"), res("c", "paused")])
    );
    expect(state.map((r) => r.id)).toEqual(["a", "c"]);
  });

  it("clears all restaurants", () => {
    const state = reducer(undefined, initRestaurants([res("a")]));
    expect(reducer(state, clearRestaurants())).toEqual([]);
  });
});
