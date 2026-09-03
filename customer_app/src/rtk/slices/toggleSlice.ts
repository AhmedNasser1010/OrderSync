import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/rtk/store";

export interface ToggleState {
  isOrderSidebarOpen: boolean;
  isMenuOpen: boolean;
  lng: string;
  showItemsAlreadyInCartPopup: boolean;
  showTrackedOrderLockPopup: boolean;
  showResClosedPopup: boolean;
  showResPausedPopup: boolean;
  showRestaurantUnavailablePopup: boolean;
  showOutOfRangePopup: boolean;
  showOrderPlacementErrorDialog: boolean;
  showOrderPlacementLoading: boolean;
  showOrderPlacementSuccess: boolean;
  rateIsOpen: boolean;
  cancellationNoticeIsOpen: boolean;
  cancellationNoticeData: {
    status?: string;
    cancellationReason?: string;
    cancelledByCustomer?: boolean;
  } | null;
  rateDismissedOrderId: string | null;
  cancellationDismissedOrderId: string | null;
  hasOrder: boolean;
  theme: "light" | "dark";
}

const initialState: ToggleState = {
  isOrderSidebarOpen: false,
  isMenuOpen: false,
  lng: "ar",
  showItemsAlreadyInCartPopup: false,
  showTrackedOrderLockPopup: false,
  showResClosedPopup: false,
  showResPausedPopup: false,
  showRestaurantUnavailablePopup: false,
  showOutOfRangePopup: false,
  showOrderPlacementErrorDialog: false,
  showOrderPlacementLoading: false,
  showOrderPlacementSuccess: false,
  rateIsOpen: false,
  cancellationNoticeIsOpen: false,
  cancellationNoticeData: null,
  rateDismissedOrderId: null,
  cancellationDismissedOrderId: null,
  hasOrder: true,
  theme: "light",
};

const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    toggleOrderSidebar: (state) => {
      state.isOrderSidebarOpen = !state.isOrderSidebarOpen;
    },
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    setMenuIsOpen: (state, { payload }) => {
      state.isMenuOpen = payload === undefined ? !state.isMenuOpen : payload;
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
    setShowOutOfRangePopup: (state, { payload }) => {
      state.showOutOfRangePopup =
        payload === undefined ? !state.showOutOfRangePopup : payload;
    },
    setShowOrderPlacementErrorDialog: (state, { payload }) => {
      state.showOrderPlacementErrorDialog =
        payload === undefined
          ? !state.showOrderPlacementErrorDialog
          : payload;
    },
    setShowOrderPlacementLoading: (state, { payload }) => {
      state.showOrderPlacementLoading =
        payload === undefined ? !state.showOrderPlacementLoading : payload;
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
      state.showOutOfRangePopup = false;
      state.showOrderPlacementErrorDialog = false;
      state.showOrderPlacementLoading = false;
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
    setCancellationNoticeData: (state, { payload }) => {
      state.cancellationNoticeData = payload;
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
  toggleOrderSidebar,
  toggleMenu,
  setMenuIsOpen,
  setOrderSidebarIsOpen,
  toggleLng,
  setShowItemsAlreadyInCartPopup,
  setShowTrackedOrderLockPopup,
  setShowResClosedPopup,
  setShowResPausedPopup,
  setShowRestaurantUnavailablePopup,
  setShowOutOfRangePopup,
  setShowOrderPlacementErrorDialog,
  setShowOrderPlacementLoading,
  setShowOrderPlacementSuccess,
  resetPopupStates,
  setRateIsOpen,
  setHasOrder,
  setCancellationNoticeIsOpen,
  setCancellationNoticeData,
  setRateDismissedOrderId,
  setCancellationDismissedOrderId,
  initTheme,
  setTheme,
} = toggleSlice.actions;

export const selectTheme = (state: RootState) => state.toggle.theme;

export default toggleSlice.reducer;
