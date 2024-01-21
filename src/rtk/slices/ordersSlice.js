import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from "../../firebase.js";

// Functions
import _getSubcollections from "../../function/_getSubcollections.js";

export const fetchOrders = createAsyncThunk("orders/fetchOrders", (ordersIDs, thunkAPI) => {

  const currentState = thunkAPI.getState();

  if (currentState.orders.length === 0) {
    console.log('get data start')
    return _getSubcollections("orders", ordersIDs);
  }

  return currentState.orders;
});

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: [],
  reducers: {
    clearOrders: () => {
      return [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOrders.fulfilled, (state, { payload }) => {
      return payload;
    })
  },
})


export const {
  clearOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;