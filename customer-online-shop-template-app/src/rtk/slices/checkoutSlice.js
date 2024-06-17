import { createSlice } from '@reduxjs/toolkit';

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {},
  reducers: {
    clearCheckout: (state, { payload }) => {
      return {}
    },
    addCheckout: (state, { payload }) => {
      return {
        ...state,
        ...payload
      }
    },
    addToUserLocation: (state, { payload }) => {
      return {
        ...state,
        location: {
          ...state.location,
          ...payload
        }
      }
    }
  },
})


export const {
  clearCheckout,
  addCheckout,
  addToUserLocation
} = checkoutSlice.actions;

export default checkoutSlice.reducer;