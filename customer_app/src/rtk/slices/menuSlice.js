import { createSlice } from '@reduxjs/toolkit';

export const menuSlice = createSlice({
  name: 'cart',
  initialState: {
    accessToken: '',
    items: [],
    categries: []
  },
  reducers: {
    initMenu: (state, { payload }) => {
      return payload;
    },
    clearMenu: (state, { payload }) => {
      return {
        accessToken: '',
        items: [],
        categries: []
      }
    }
  },
})


export const {
  initMenu,
  clearMenu
} = menuSlice.actions;

export default menuSlice.reducer;