import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import QuantityStepper from "./QuantityStepper";
import cartReducer from "@/rtk/slices/cartSlice";
import toggleReducer from "@/rtk/slices/toggleSlice";
import userReducer, { initUser } from "@/rtk/slices/userSlice";
import menuReducer, { initMenu } from "@/rtk/slices/menuSlice";
import restaurantsReducer from "@/rtk/slices/restaurantsSlice";
import type { ItemType } from "@ordersync/types";

const NOW = 1_700_000_000_000;

const item: ItemType = {
  id: "burger",
  title: "Burger",
  price: 100,
  topMenu: true,
  visibility: true,
  category: "cat-1",
  backgrounds: [],
  createdAt: NOW,
  updatedAt: NOW,
};

function setup(seedTrackedOrder = false) {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      toggle: toggleReducer,
      user: userReducer,
      menu: menuReducer,
      restaurants: restaurantsReducer,
    },
  });
  store.dispatch(
    initMenu({
      accessToken: "res-1",
      items: [item],
      categories: [],
      orderDiscounts: [],
    })
  );
  if (seedTrackedOrder) {
    store.dispatch(initUser({ trackedOrder: { id: "order-1", orderNumber: "1234" } }));
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const view = render(
    <QuantityStepper item={item} selectedSize={null} status="active" resID="res-1" />,
    { wrapper }
  );
  return { store, view };
}

describe("QuantityStepper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the Add button when the item is not in the cart", () => {
    setup();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.queryByLabelText("Increase")).not.toBeInTheDocument();
  });

  it("adds the item on Add and then steppers adjust quantity", async () => {
    const { store } = setup();
    fireEvent.click(screen.getByText("Add"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(store.getState().cart.items).toEqual([
      { id: "burger", quantity: 1, selectedSize: null },
    ]);

    fireEvent.click(screen.getByLabelText("Increase"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(store.getState().cart.items[0].quantity).toBe(2);

    fireEvent.click(screen.getByLabelText("Decrease"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(store.getState().cart.items[0].quantity).toBe(1);
  });

  it("blocks changes when there is an active tracked order", async () => {
    const { store } = setup(true);
    // Quantity is 0 → renders the Add button instead of the stepper.
    fireEvent.click(screen.getByText("Add"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    // Tracked order blocks the add.
    expect(store.getState().cart.items).toEqual([]);
    expect(store.getState().toggle.showTrackedOrderLockPopup).toBe(true);
  });
});
