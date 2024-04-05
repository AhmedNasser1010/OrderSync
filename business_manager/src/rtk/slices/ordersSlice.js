import { createSlice } from '@reduxjs/toolkit';

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: [],
  reducers: {
    setOrders: (state, { payload }) => {
      return payload;
    },
    clearOrders: (state, { payload }) => {
      return [];
    },
  },
})


export const {
  setOrders,
  clearOrders
} = ordersSlice.actions;

export default ordersSlice.reducer;