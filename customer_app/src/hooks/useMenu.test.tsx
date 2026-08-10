import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import useMenu from "./useMenu";
import menuReducer, { initMenu } from "@/rtk/slices/menuSlice";
import cartReducer, { addToCart } from "@/rtk/slices/cartSlice";
import userReducer from "@/rtk/slices/userSlice";
import type { ItemType } from "@ordersync/types";

const NOW = 1_700_000_000_000;

const item = (id: string, price: number, discount?: ItemType["discount"]): ItemType => ({
  id,
  title: id,
  price,
  topMenu: true,
  visibility: true,
  category: "cat-1",
  backgrounds: [],
  createdAt: NOW,
  updatedAt: NOW,
  ...(discount ? { discount } : {}),
});

function renderUseMenu(state: {
  items?: ItemType[];
  cart?: Array<{ id: string; quantity: number }>;
}) {
  const store = configureStore({
    reducer: { menu: menuReducer, cart: cartReducer, user: userReducer },
  });
  store.dispatch(
    initMenu({
      accessToken: "res-1",
      items: state.items ?? [],
      categories: [],
      orderDiscounts: [],
    })
  );
  (state.cart ?? []).forEach((c) => store.dispatch(addToCart(c)));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useMenu(), { wrapper });
}

describe("useMenu", () => {
  it("totals the items currently in the store cart", () => {
    const { result } = renderUseMenu({
      items: [item("a", 100), item("b", 50)],
      cart: [
        { id: "a", quantity: 2 },
        { id: "b", quantity: 1 },
      ],
    });
    const { items, price } = result.current();
    expect(items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(items[0].quantity).toBe(2);
    expect(price.total).toBe(250);
    expect(price.discount).toBe(250);
  });

  it("computes totals from explicit arguments without the store", () => {
    const { result } = renderUseMenu({});
    const { price } = result.current(
      [item("a", 100)],
      [{ id: "a", quantity: 3 }]
    );
    expect(price.total).toBe(300);
    expect(price.discount).toBe(300);
  });

  it("reflects item-level discounts in the discounted price", () => {
    const { result } = renderUseMenu({});
    const { price } = result.current(
      [item("a", 100, { id: "d", code: "ITEM20", message: "20 off", level: "item", type: "FIXED", value: 20, conditions: { operator: "AND", rules: [] }, active: true })],
      [{ id: "a", quantity: 1 }]
    );
    expect(price.total).toBe(100);
    expect(price.discount).toBe(80);
  });

  it("returns no items for an empty cart", () => {
    const { result } = renderUseMenu({ items: [item("a", 100)] });
    const { items, price } = result.current();
    expect(items).toEqual([]);
    expect(price).toEqual({ total: 0, discount: 0 });
  });
});
