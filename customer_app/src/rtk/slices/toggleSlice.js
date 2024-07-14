import { createSlice } from "@reduxjs/toolkit"

const toggleSlice = createSlice({
  name: "toggle",
  initialState: {
    isLocationSidebarOpen: false,
    isLoginSidebarOpen: false,
    isOrderSidebarOpen: false,
    lng: 'ar'
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
  },
})

export const {
  toggleLocationSidebar,
  toggleLoginSidebar,
  toggleOrderSidebar,
  toggleLng
} = toggleSlice.actions
export default toggleSlice.reducer