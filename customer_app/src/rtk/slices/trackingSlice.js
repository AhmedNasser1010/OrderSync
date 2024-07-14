import { createSlice } from '@reduxjs/toolkit'

export const trackingSlice = createSlice({
  name: 'tracking',
  initialState: {
    order: null,
    driver: null,
    res: null
  },
  reducers: {
    initOrder: (state, { payload }) => {
      state.order = payload
    },
    initDriver: (state, { payload }) => {
      state.driver = payload
    },
    initRes: (state, { payload }) => {
      state.res = payload
    },
    trackingReset: () => {
      return {
        order: null,
        driver: null,
        res: null
      }
    },
    clearOrder: (state) => {
      state.order = null
    },
    clearDriver: (state) => {
      state.driver = null
    },
    clearRes: (state) => {
      state.res = null
    },
  },
})


export const {
  initOrder,
  initDriver,
  initRes,
  trackingReset,
  clearOrder,
  clearDriver,
  clearRes
} = trackingSlice.actions

export default trackingSlice.reducer