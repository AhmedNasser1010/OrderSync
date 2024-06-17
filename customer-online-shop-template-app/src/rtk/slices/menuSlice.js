import { createSlice } from '@reduxjs/toolkit';

export const menuSlice = createSlice({
  name: 'cart',
  initialState: {},
  reducers: {
    setMenu: (state, { payload }) => {
      return payload;
    },
    clearMenu: (state, { payload }) => {
      return {};
    }
  },
})


export const {
  setMenu,
  clearMenu
} = menuSlice.actions;

export default menuSlice.reducer;