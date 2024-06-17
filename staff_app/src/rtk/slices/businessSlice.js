import { createSlice } from '@reduxjs/toolkit';

export const businessSlice = createSlice({
  name: 'business',
  initialState: {},
  reducers: {
    initBusiness: (state, { payload }) => {
      return payload
    },
    clearBusiness: (state, { payload }) => {
      return {}
    },
  },
})


export const {
  initBusiness,
  clearBusiness
} = businessSlice.actions

export default businessSlice.reducer