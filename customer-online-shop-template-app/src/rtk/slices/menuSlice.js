import { createSlice } from '@reduxjs/toolkit';

export const menuSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    categories: []
  },
  reducers: {
    setMenu: (state, { payload }) => {
      return payload;
    },
    clearMenu: (state, { payload }) => {
      return {
        items: [],
        categories: []
      }
    }
  },
})


export const {
  setMenu,
  clearMenu
} = menuSlice.actions;

export default menuSlice.reducer;