import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import useItemInfo from "./useItemInfo";
import menuReducer, { initMenu } from "@/rtk/slices/menuSlice";
import userReducer from "@/rtk/slices/userSlice";
import type { ItemType, CategoryType } from "@ordersync/types";

const NOW = 1_700_000_000_000;

const category: CategoryType = {
  id: "cat-1",
  title: "Main",
  topMenu: true,
  visibility: true,
  createdAt: NOW,
  updatedAt: NOW,
};

const sizedItem: ItemType & { selectedSize?: { size: string; price: string } | null } = {
  id: "pizza",
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
  selectedSize: { size: "Large", price: "60" },
  createdAt: NOW,
  updatedAt: NOW,
};

function renderUseItemInfo(item: ItemType & { selectedSize?: unknown }, resId = "res-1") {
  const store = configureStore({
    reducer: { menu: menuReducer, user: userReducer },
  });
  store.dispatch(
    initMenu({
      accessToken: resId,
      items: [item as ItemType],
      categories: [category],
      orderDiscounts: [],
    })
  );
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useItemInfo(item, resId), { wrapper });
}

describe("useItemInfo", () => {
  it("reads the price from the initially selected size", () => {
    const { result } = renderUseItemInfo(sizedItem);
    expect(result.current.selectedSize).toBe("Large");
    expect(result.current.itemPrice).toBe(60);
    expect(result.current.afterDiscount.finalPrice).toBe(60);
    expect(result.current.discountIncluded).toBe(false);
  });

  it("switches price and dispatchs the size selection when a size is chosen", () => {
    const { result } = renderUseItemInfo(sizedItem);
    act(() => {
      result.current.handleSetSelectedSize("Small");
    });
    expect(result.current.selectedSize).toBe("Small");
    expect(result.current.itemPrice).toBe(40);
    expect(result.current.afterDiscount.finalPrice).toBe(40);
  });

  it("returns the base price when no size is selected", () => {
    const plain = { ...sizedItem, selectedSize: null };
    const { result } = renderUseItemInfo(plain);
    expect(result.current.itemPrice).toBe(50);
  });

  it("marks discountIncluded when an item discount lowers the price", () => {
    const discounted: ItemType = {
      ...sizedItem,
      price: 100,
      selectedSize: undefined,
      sizes: undefined,
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
    };
    const { result } = renderUseItemInfo(discounted);
    expect(result.current.itemPrice).toBe(100);
    expect(result.current.afterDiscount.finalPrice).toBe(80);
    expect(result.current.discountIncluded).toBe(true);
  });
});
