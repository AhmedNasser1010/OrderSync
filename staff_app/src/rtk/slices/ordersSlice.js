import { createSlice } from '@reduxjs/toolkit';

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: [],
  reducers: {
    initOrders: (state, { payload }) => {
      return payload
    },
    clearOrders: (state, { payload }) => {
      return []
    },
    changeOrderState: (state, { payload }) => {
      const { id, status } = payload
      return [
        ...state.map(order => {
          if (id === order.id) {
            return {
              ...order,
              status: status
            }
          }
          return order
        })
      ]
    },
  },
})


export const {
  initOrders,
  clearOrders,
  changeOrderState
} = ordersSlice.actions

export default ordersSlice.reducer