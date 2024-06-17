import { createSlice } from '@reduxjs/toolkit'

export const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    setCart: (state, { payload }) => {
      return payload
    },
    clearCart: (state, { payload }) => {
      return []
    },
    addToCart: (state, { payload }) => {
      const existingCartItemIndex = state.findIndex(cartItem => cartItem.id === payload.id);

      if (existingCartItemIndex !== -1) {
        return state.map((cartItem, index) =>
          index === existingCartItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + payload.quantity }
            : cartItem
        );
      } else {
        return [...state, { ...payload }];
      }
    },
    quantityHandle: (state, { payload }) => {
      return [
        ...state.map(item => {
          if (item.id === payload.id) {
            return { ...item, quantity: payload.quantity }
          } else {
            return item
          }
        })
      ]
    },
    deleteFromCart: (state, { payload }) => {
      return [
        ...state.filter(item => item.id !== payload)
      ]
    }
  },
})

export const {
  setCart,
  clearCart,
  addToCart,
  quantityHandle,
  deleteFromCart
} = cartSlice.actions

export default cartSlice.reducer