import { describe, it, expect, beforeEach } from "vitest";
import reducer, {
  hydrateCart,
  clearCart,
  addToCart,
  removeFromCart,
  quantityHandle,
  setRestaurant,
  handleAddDiscount,
  applyOrderDiscount,
  removeOrderDiscount,
  type CartState,
} from "./cartSlice";

const emptyCart = (): CartState => ({
  items: [],
  restaurant: "",
  appliedOrderDiscount: null,
  hydrated: false,
});

describe("cartSlice", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual(emptyCart());
  });

  it("adds an item to the cart and persists it", () => {
    let state = reducer(undefined, addToCart({ id: "item-1", quantity: 1 }));
    state = reducer(state, addToCart({ id: "item-2", quantity: 2 }));
    expect(state.items).toEqual([
      { id: "item-1", quantity: 1 },
      { id: "item-2", quantity: 2 },
    ]);
    expect(window.localStorage.getItem("cartState")).toContain("item-1");
  });

  it("hydrates the cart from localStorage", () => {
    window.localStorage.setItem(
      "cartState",
      JSON.stringify({
        items: [{ id: "item-1", quantity: 3 }],
        restaurant: "res-1",
        appliedOrderDiscount: null,
        hydrated: true,
      })
    );
    const state = reducer(emptyCart(), hydrateCart());
    expect(state.items).toEqual([{ id: "item-1", quantity: 3 }]);
    expect(state.restaurant).toBe("res-1");
    expect(state.hydrated).toBe(true);
  });

  it("hydrates only once", () => {
    window.localStorage.setItem(
      "cartState",
      JSON.stringify({ items: [{ id: "a", quantity: 1 }], restaurant: "" })
    );
    let state = reducer(emptyCart(), hydrateCart());
    state = reducer(state, hydrateCart());
    state = reducer(state, addToCart({ id: "b", quantity: 1 }));
    expect(state.items).toEqual([{ id: "a", quantity: 1 }, { id: "b", quantity: 1 }]);
  });

  it("ignores malformed localStorage on hydrate", () => {
    window.localStorage.setItem("cartState", "{not-json");
    const state = reducer(emptyCart(), hydrateCart());
    expect(state.items).toEqual([]);
  });

  it("clears the cart but keeps the hydrated flag", () => {
    let state = reducer(undefined, addToCart({ id: "a", quantity: 1 }));
    state = reducer(state, clearCart());
    expect(state).toEqual({ ...emptyCart(), hydrated: true });
  });

  it("removes an item by id and size", () => {
    let state = reducer(undefined, addToCart({ id: "a", quantity: 1, selectedSize: "S" }));
    state = reducer(state, addToCart({ id: "a", quantity: 1, selectedSize: "L" }));
    state = reducer(state, removeFromCart({ id: "a", selectedSize: "S" }));
    expect(state.items).toEqual([{ id: "a", quantity: 1, selectedSize: "L" }]);
  });

  it("clears the restaurant when the last item is removed", () => {
    let state = reducer(undefined, addToCart({ id: "a", quantity: 1 }));
    state = reducer(state, setRestaurant("res-1"));
    state = reducer(state, removeFromCart({ id: "a" }));
    expect(state.restaurant).toBe("");
  });

  it("increments and decrements quantity without going below 1", () => {
    let state = reducer(undefined, addToCart({ id: "a", quantity: 2 }));
    state = reducer(state, quantityHandle({ id: "a", quantity: "+" }));
    expect(state.items[0].quantity).toBe(3);
    state = reducer(state, quantityHandle({ id: "a", quantity: "-" }));
    state = reducer(state, quantityHandle({ id: "a", quantity: "-" }));
    expect(state.items[0].quantity).toBe(1);
  });

  it("removes an item entirely when decrementing from 1", () => {
    let state = reducer(undefined, addToCart({ id: "a", quantity: 1 }));
    state = reducer(state, quantityHandle({ id: "a", quantity: "-" }));
    expect(state.items).toEqual([]);
  });

  it("sets the restaurant", () => {
    const state = reducer(undefined, setRestaurant("res-9"));
    expect(state.restaurant).toBe("res-9");
  });

  it("attaches a discount code to matching items only", () => {
    let state = reducer(undefined, addToCart({ id: "a", quantity: 1 }));
    state = reducer(state, addToCart({ id: "b", quantity: 1 }));
    state = reducer(state, handleAddDiscount({ id: "a", discountCode: "ITEM20" }));
    expect(state.items).toEqual([
      { id: "a", quantity: 1, discountCode: "ITEM20" },
      { id: "b", quantity: 1 },
    ]);
  });

  it("applies and removes an order-level discount", () => {
    let state = reducer(undefined, applyOrderDiscount({ id: "d1" }));
    expect(state.appliedOrderDiscount).toEqual({ id: "d1" });
    state = reducer(state, removeOrderDiscount());
    expect(state.appliedOrderDiscount).toBeNull();
  });
});
