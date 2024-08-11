import { createSlice } from '@reduxjs/toolkit';

export const menuSlice = createSlice({
  name: 'cart',
  initialState: {
    accessToken: '',
    items: [],
    categories: []
  },
  reducers: {
    initMenu: (state, { payload }) => {
      return payload;
    },
    clearMenu: (state, { payload }) => {
      return {
        accessToken: '',
        items: [],
        categories: []
      }
    }
  },
})


export const {
  initMenu,
  clearMenu
} = menuSlice.actions;

export default menuSlice.reducer;