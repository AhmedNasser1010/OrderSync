import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/rtk/store";

export interface ToggleState {
  isLoginSidebarOpen: boolean;
  isOrderSidebarOpen: boolean;
  lng: string;
  showItemsAlreadyInCartPopup: boolean;
  showTrackedOrderLockPopup: boolean;
  showResClosedPopup: boolean;
  showResPausedPopup: boolean;
  showRestaurantUnavailablePopup: boolean;
  showOrderPlacementErrorDialog: boolean;
  showOrderPlacementSuccess: boolean;
  rateIsOpen: boolean;
  cancellationNoticeIsOpen: boolean;
  rateDismissedOrderId: string | null;
  cancellationDismissedOrderId: string | null;
  hasOrder: boolean;
  theme: "light" | "dark";
}

const initialState: ToggleState = {
  isLoginSidebarOpen: false,
  isOrderSidebarOpen: false,
  lng: "ar",
  showItemsAlreadyInCartPopup: false,
  showTrackedOrderLockPopup: false,
  showResClosedPopup: false,
  showResPausedPopup: false,
  showRestaurantUnavailablePopup: false,
  showOrderPlacementErrorDialog: false,
  showOrderPlacementSuccess: false,
  rateIsOpen: false,
  cancellationNoticeIsOpen: false,
  rateDismissedOrderId: null,
  cancellationDismissedOrderId: null,
  hasOrder: true,
  theme: "light",
};

const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    toggleLoginSidebar: (state) => {
      state.isLoginSidebarOpen = !state.isLoginSidebarOpen;
    },
    toggleOrderSidebar: (state) => {
      state.isOrderSidebarOpen = !state.isOrderSidebarOpen;
    },
    setOrderSidebarIsOpen: (state, { payload }) => {
      state.isOrderSidebarOpen =
        payload === undefined ? !state.isOrderSidebarOpen : payload;
    },
    toggleLng: (state, { payload }: PayloadAction<string>) => {
      state.lng = payload;
    },
    setShowItemsAlreadyInCartPopup: (state, { payload }) => {
      state.showItemsAlreadyInCartPopup =
        payload === undefined ? !state.showItemsAlreadyInCartPopup : payload;
    },
    setShowTrackedOrderLockPopup: (state, { payload }) => {
      state.showTrackedOrderLockPopup =
        payload === undefined ? !state.showTrackedOrderLockPopup : payload;
    },
    setShowResClosedPopup: (state, { payload }) => {
      state.showResClosedPopup =
        payload === undefined ? !state.showResClosedPopup : payload;
    },
    setShowResPausedPopup: (state, { payload }) => {
      state.showResPausedPopup =
        payload === undefined ? !state.showResPausedPopup : payload;
    },
    setShowRestaurantUnavailablePopup: (state, { payload }) => {
      state.showRestaurantUnavailablePopup =
        payload === undefined ? !state.showRestaurantUnavailablePopup : payload;
    },
    setShowOrderPlacementErrorDialog: (state, { payload }) => {
      state.showOrderPlacementErrorDialog =
        payload === undefined
          ? !state.showOrderPlacementErrorDialog
          : payload;
    },
    setShowOrderPlacementSuccess: (state, { payload }) => {
      state.showOrderPlacementSuccess =
        payload === undefined ? !state.showOrderPlacementSuccess : payload;
    },
    resetPopupStates: (state) => {
      state.showItemsAlreadyInCartPopup = false;
      state.showTrackedOrderLockPopup = false;
      state.showResClosedPopup = false;
      state.showResPausedPopup = false;
      state.showRestaurantUnavailablePopup = false;
      state.showOrderPlacementErrorDialog = false;
      state.showOrderPlacementSuccess = false;
    },
    setRateIsOpen: (state, { payload }) => {
      state.rateIsOpen = payload === undefined ? !state.rateIsOpen : payload;
    },
    setHasOrder: (state, { payload }) => {
      state.hasOrder = payload === undefined ? !state.hasOrder : payload;
    },
    setCancellationNoticeIsOpen: (state, { payload }) => {
      state.cancellationNoticeIsOpen =
        payload === undefined ? !state.cancellationNoticeIsOpen : payload;
    },
    setRateDismissedOrderId: (
      state,
      { payload }: PayloadAction<string | null>
    ) => {
      state.rateDismissedOrderId = payload;
    },
    setCancellationDismissedOrderId: (
      state,
      { payload }: PayloadAction<string | null>
    ) => {
      state.cancellationDismissedOrderId = payload;
    },
    initTheme: (state) => {
      let saved: string | null = null;
      if (typeof window !== "undefined") {
        saved = window.localStorage.getItem("theme");
      }
      if (saved === "dark" || saved === "light") {
        state.theme = saved;
      } else if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        state.theme = "dark";
      }
    },
    setTheme: (state, { payload }: PayloadAction<"light" | "dark">) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("theme", payload);
      }
      state.theme = payload;
    },
  },
});

export const {
  toggleLoginSidebar,
  toggleOrderSidebar,
  setOrderSidebarIsOpen,
  toggleLng,
  setShowItemsAlreadyInCartPopup,
  setShowTrackedOrderLockPopup,
  setShowResClosedPopup,
  setShowResPausedPopup,
  setShowRestaurantUnavailablePopup,
  setShowOrderPlacementErrorDialog,
  setShowOrderPlacementSuccess,
  resetPopupStates,
  setRateIsOpen,
  setHasOrder,
  setCancellationNoticeIsOpen,
  setRateDismissedOrderId,
  setCancellationDismissedOrderId,
  initTheme,
  setTheme,
} = toggleSlice.actions;

export const selectTheme = (state: RootState) => state.toggle.theme;

export default toggleSlice.reducer;
