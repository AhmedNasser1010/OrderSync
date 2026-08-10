import { describe, it, expect } from "vitest";
import reducer, { initMenu, clearMenu, selectItemSize } from "./menuSlice";
import type { ItemType, SizeType } from "@ordersync/types";

const NOW = 1_700_000_000_000;

const item = (id: string): ItemType => ({
  id,
  title: `Item ${id}`,
  price: 10,
  topMenu: true,
  visibility: true,
  category: "cat-1",
  backgrounds: [],
  createdAt: NOW,
  updatedAt: NOW,
});

describe("menuSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
      accessToken: "",
      items: [],
      categories: [],
      orderDiscounts: [],
    });
  });

  it("initializes the full menu", () => {
    const menu = {
      accessToken: "res-1",
      items: [item("a")],
      categories: [],
      orderDiscounts: [],
    };
    expect(reducer(undefined, initMenu(menu))).toEqual(menu);
  });

  it("clears the menu", () => {
    const state = reducer(undefined, initMenu({ accessToken: "r", items: [item("a")], categories: [], orderDiscounts: [] }));
    expect(reducer(state, clearMenu())).toEqual({
      accessToken: "",
      items: [],
      categories: [],
      orderDiscounts: [],
    });
  });

  it("selects a size for the matching item only", () => {
    const size: SizeType = { size: "Large", price: "20" };
    let state = reducer(undefined, initMenu({
      accessToken: "r",
      items: [item("a"), item("b")],
      categories: [],
      orderDiscounts: [],
    }));
    state = reducer(state, selectItemSize({ id: "a", selectedSize: size }));
    expect(state.items[0].selectedSize).toEqual(size);
    expect(state.items[1].selectedSize).toBeUndefined();
  });

  it("clears the selected size with null", () => {
    let state = reducer(undefined, initMenu({
      accessToken: "r",
      items: [item("a")],
      categories: [],
      orderDiscounts: [],
    }));
    state = reducer(state, selectItemSize({ id: "a", selectedSize: { size: "S", price: "5" } }));
    state = reducer(state, selectItemSize({ id: "a", selectedSize: null }));
    expect(state.items[0].selectedSize).toBeNull();
  });
});
