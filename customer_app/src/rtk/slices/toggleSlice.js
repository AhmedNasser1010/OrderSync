import { createSlice } from "@reduxjs/toolkit"

const toggleSlice = createSlice({
  name: "toggle",
  initialState: {
    isLocationSidebarOpen: false,
    isLoginSidebarOpen: false,
    isOrderSidebarOpen: false,
    lng: 'ar',
    showItemsAlreadyInCartPopup: false,
    showResClosedPopup: false,
    showResPausedPopup: false,
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
    setShowResClosedPopup: (state, { payload }) => {
      state.showResClosedPopup = payload === undefined ? !state.showResClosedPopup : payload
    },
    setShowResPausedPopup: (state, { payload }) => {
      state.showResPausedPopup = payload === undefined ? !state.showResPausedPopup : payload
    },
    resetPopupStates: (state) => {
      state.showItemsAlreadyInCartPopup = false
      state.showResClosedPopup = false
      state.showResPausedPopup = false
    },
  },
})

export const {
  toggleLocationSidebar,
  toggleLoginSidebar,
  toggleOrderSidebar,
  toggleLng,
  setShowItemsAlreadyInCartPopup,
  setShowResClosedPopup,
  setShowResPausedPopup,
  resetPopupStates
} = toggleSlice.actions
export default toggleSlice.reducer