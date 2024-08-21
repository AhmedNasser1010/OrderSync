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
    },
    selectItemSize: (state, { payload }) => {
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === payload.id) {
            return {
              ...item,
              selectedSize: payload.selectedSize
            }
          }
          return item
        })
      }
    }
  },
})


export const {
  initMenu,
  clearMenu,
  selectItemSize
} = menuSlice.actions;

export default menuSlice.reducer;