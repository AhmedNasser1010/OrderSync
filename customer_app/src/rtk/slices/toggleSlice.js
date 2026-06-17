import { createSlice } from "@reduxjs/toolkit"

const toggleSlice = createSlice({
  name: "toggle",
  initialState: {
    isLocationSidebarOpen: false,
    isLoginSidebarOpen: false,
    isOrderSidebarOpen: false,
    lng: 'ar',
    showItemsAlreadyInCartPopup: false,
    showTrackedOrderLockPopup: false,
    showResClosedPopup: false,
    showResPausedPopup: false,
    showRestaurantUnavailablePopup: false,
    rateIsOpen: false,
    cancellationNoticeIsOpen: false,
    hasOrder: true
  },
  reducers: {
    toggleLocationSidebar: (state) => {
      state.isLocationSidebarOpen = !state.isLocationSidebarOpen
    },
    toggleLoginSidebar: (state) => {
      state.isLoginSidebarOpen = !state.isLoginSidebarOpen
    },
    toggleOrderSidebar: (state) => {
      state.isOrderSidebarOpen = !state.isOrderSidebarOpen
    },
    toggleLng: (state, { payload }) => {
      state.lng = payload
    },
    setShowItemsAlreadyInCartPopup: (state, { payload }) => {
      state.showItemsAlreadyInCartPopup = payload === undefined ? !state.showItemsAlreadyInCartPopup : payload
    },
    setShowTrackedOrderLockPopup: (state, { payload }) => {
      state.showTrackedOrderLockPopup =
        payload === undefined ? !state.showTrackedOrderLockPopup : payload
    },
    setShowResClosedPopup: (state, { payload }) => {
      state.showResClosedPopup = payload === undefined ? !state.showResClosedPopup : payload
    },
    setShowResPausedPopup: (state, { payload }) => {
      state.showResPausedPopup = payload === undefined ? !state.showResPausedPopup : payload
    },
    setShowRestaurantUnavailablePopup: (state, { payload }) => {
      state.showRestaurantUnavailablePopup =
        payload === undefined ? !state.showRestaurantUnavailablePopup : payload
    },
    resetPopupStates: (state) => {
      state.showItemsAlreadyInCartPopup = false
      state.showTrackedOrderLockPopup = false
      state.showResClosedPopup = false
      state.showResPausedPopup = false
      state.showRestaurantUnavailablePopup = false
    },
    setRateIsOpen: (state, { payload }) => {
      state.rateIsOpen = payload === undefined ? !state.rateIsOpen : payload
    },
    setHasOrder: (state, { payload }) => {
      state.hasOrder = payload === undefined ? !state.hasOrder : payload
    },
    setCancellationNoticeIsOpen: (state, { payload }) => {
      state.cancellationNoticeIsOpen = payload === undefined ? !state.cancellationNoticeIsOpen : payload
    }
  },
})

export const {
  toggleLocationSidebar,
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
  setCancellationNoticeIsOpen
} = toggleSlice.actions
export default toggleSlice.reducer
