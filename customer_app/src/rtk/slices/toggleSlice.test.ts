import { describe, it, expect, beforeEach } from "vitest";
import reducer, {
  toggleOrderSidebar,
  setMenuIsOpen,
  setOrderSidebarIsOpen,
  toggleLng,
  setShowItemsAlreadyInCartPopup,
  setShowTrackedOrderLockPopup,
  setShowResClosedPopup,
  setShowResPausedPopup,
  setShowRestaurantUnavailablePopup,
  setShowOrderPlacementErrorDialog,
  setShowOrderPlacementLoading,
  setShowOrderPlacementSuccess,
  resetPopupStates,
  setRateIsOpen,
  setHasOrder,
  setCancellationNoticeData,
  setRateDismissedOrderId,
  setCancellationDismissedOrderId,
  initTheme,
  setTheme,
  selectTheme,
} from "./toggleSlice";

describe("toggleSlice", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the initial state", () => {
    const state = reducer(undefined, { type: "unknown" });
    expect(state.lng).toBe("ar");
    expect(state.theme).toBe("light");
    expect(state.hasOrder).toBe(true);
    expect(state.isMenuOpen).toBe(false);
  });

  it("toggles the menu", () => {
    let state = reducer(undefined, setMenuIsOpen(true));
    expect(state.isMenuOpen).toBe(true);
    state = reducer(state, setMenuIsOpen(false));
    expect(state.isMenuOpen).toBe(false);
  });

  it("toggles and forces the order sidebar", () => {
    let state = reducer(undefined, toggleOrderSidebar());
    expect(state.isOrderSidebarOpen).toBe(true);
    state = reducer(state, setOrderSidebarIsOpen(true));
    expect(state.isOrderSidebarOpen).toBe(true);
    state = reducer(state, setOrderSidebarIsOpen(false));
    expect(state.isOrderSidebarOpen).toBe(false);
  });

  it("switches the locale", () => {
    const state = reducer(undefined, toggleLng("en"));
    expect(state.lng).toBe("en");
  });

  it("toggles popup flags with or without an explicit payload", () => {
    let state = reducer(undefined, setShowItemsAlreadyInCartPopup());
    expect(state.showItemsAlreadyInCartPopup).toBe(true);
    state = reducer(state, setShowItemsAlreadyInCartPopup(false));
    expect(state.showItemsAlreadyInCartPopup).toBe(false);
  });

  it("resets all popup states", () => {
    let state = reducer(undefined, setShowOrderPlacementErrorDialog());
    state = reducer(state, setShowResClosedPopup());
    state = reducer(state, setShowRestaurantUnavailablePopup());
    state = reducer(state, setShowOrderPlacementLoading());
    state = reducer(state, setShowOrderPlacementSuccess());
    state = reducer(state, setShowTrackedOrderLockPopup());
    state = reducer(state, setShowResPausedPopup());
    state = reducer(state, setShowItemsAlreadyInCartPopup());
    const reset = reducer(state, resetPopupStates());
    expect(reset.showItemsAlreadyInCartPopup).toBe(false);
    expect(reset.showTrackedOrderLockPopup).toBe(false);
    expect(reset.showResClosedPopup).toBe(false);
    expect(reset.showResPausedPopup).toBe(false);
    expect(reset.showRestaurantUnavailablePopup).toBe(false);
    expect(reset.showOrderPlacementErrorDialog).toBe(false);
    expect(reset.showOrderPlacementLoading).toBe(false);
    expect(reset.showOrderPlacementSuccess).toBe(false);
  });

  it("toggles rateIsOpen and hasOrder", () => {
    let state = reducer(undefined, setRateIsOpen());
    expect(state.rateIsOpen).toBe(true);
    state = reducer(state, setHasOrder(false));
    expect(state.hasOrder).toBe(false);
    state = reducer(state, setHasOrder());
    expect(state.hasOrder).toBe(true);
  });

  it("stores cancellation notice data", () => {
    const state = reducer(
      undefined,
      setCancellationNoticeData({ status: "CANCELED", cancelledByCustomer: true })
    );
    expect(state.cancellationNoticeData).toEqual({
      status: "CANCELED",
      cancelledByCustomer: true,
    });
  });

  it("remembers dismissed order ids", () => {
    let state = reducer(undefined, setRateDismissedOrderId("order-1"));
    state = reducer(state, setCancellationDismissedOrderId("order-2"));
    expect(state.rateDismissedOrderId).toBe("order-1");
    expect(state.cancellationDismissedOrderId).toBe("order-2");
  });

  it("loads the saved theme and persists new ones", () => {
    window.localStorage.setItem("theme", "dark");
    const state = reducer(undefined, initTheme());
    expect(state.theme).toBe("dark");

    const next = reducer(state, setTheme("light"));
    expect(next.theme).toBe("light");
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it("falls back to the light theme when nothing is saved", () => {
    const state = reducer(undefined, initTheme());
    expect(state.theme).toBe("light");
  });

  it("selects the theme via selector", () => {
    const state = { toggle: reducer(undefined, setTheme("dark")) };
    expect(selectTheme(state)).toBe("dark");
  });
});
