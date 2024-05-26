import { createSlice } from '@reduxjs/toolkit';

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    open: [],
    closed: []
  },
  reducers: {
    setOrders: (state, { payload }) => {
      return payload;
    },
    clearOrders: (state, { payload }) => {
      return {
        open: [],
        closed: []
      };
    },
    changeOrderState: (state, { payload }) => {
      const { IDs, status } = payload;
      return {
        ...state,
        open: [
          ...state.open.map(stateObject => {
            if (IDs.includes(stateObject.id)) {
              return {
                ...stateObject,
                status: status
              };
            }
            return stateObject;
          })
        ]
      };
    },
    deleteOrder: (state, { payload }) => {
      return {
        ...state,
        open: [
          ...state.open.filter(stateObject => !payload.includes(stateObject.id))
        ]
      }
    },
    newTestOrder: (state, { payload }) => {
      return {
        ...state,
        open: [
          ...state.open,
          payload
        ]
      };
    },
    setOpenedOrders: (state, { payload }) => {
      return {
        ...state,
        open: payload
      }
    },
    storeOrder: (state, { payload }) => {
      return {
        ...state,
        closed: [
          ...state.closed,
          {
            timestamp: Date.now(),
            orders: state.open.filter(stateObject => payload.includes(stateObject.id))
          }
        ]
      }
    }
  },
})


export const {
  setOrders,
  clearOrders,
  changeOrderState,
  deleteOrder,
  newTestOrder,
  setOpenedOrders,
  storeOrder
} = ordersSlice.actions;

export default ordersSlice.reducer;