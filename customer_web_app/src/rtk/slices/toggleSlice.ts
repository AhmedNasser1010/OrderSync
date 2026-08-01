import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ToggleState {
  isLoginSidebarOpen: boolean;
  isOrderSidebarOpen: boolean;
  lng: string;
  showItemsAlreadyInCartPopup: boolean;
  showTrackedOrderLockPopup: boolean;
  showResClosedPopup: boolean;
  showResPausedPopup: boolean;
  showRestaurantUnavailablePopup: boolean;
  rateIsOpen: boolean;
  cancellationNoticeIsOpen: boolean;
  hasOrder: boolean;
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
  rateIsOpen: false,
  cancellationNoticeIsOpen: false,
  hasOrder: true,
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
    resetPopupStates: (state) => {
      state.showItemsAlreadyInCartPopup = false;
      state.showTrackedOrderLockPopup = false;
      state.showResClosedPopup = false;
      state.showResPausedPopup = false;
      state.showRestaurantUnavailablePopup = false;
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
  },
});

export const {
  toggleLoginSidebar,
  toggleOrderSidebar,
  toggleLng,
  setShowItemsAlreadyInCartPopup,
  setShowTrackedOrderLockPopup,
  setShowResClosedPopup,
  setShowResPausedPopup,
  setShowRestaurantUnavailablePopup,
  resetPopupStates,
  setRateIsOpen,
  setHasOrder,
  setCancellationNoticeIsOpen,
} = toggleSlice.actions;

export default toggleSlice.reducer;
