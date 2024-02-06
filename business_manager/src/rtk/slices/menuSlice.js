import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { name: 'Espresso', discription: 'foo', categoty: 'hot-drinks', price: 2.50 },
    { name: 'Cappuccino', discription: 'foo', categoty: 'hot-drinks', price: 3.50 },
    { name: 'Iced Latte', discription: 'foo', categoty: 'cold-drinks', price: 4 },
    { name: 'Cold Brew', discription: 'foo', categoty: 'cold-drinks', price: 3.75 },
  ],
  categories: [
    { name: 'hot-drinks', discription: 'foo' },
    { name: 'cold-drinks', discription: 'foo' },
  ],
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState: initialState,
  reducers: {
    addMenu: (state, { payload }) => {
      return {...payload};
    },
    clearMenu: (state) => {
      return {};
    },
    addNewItems: (state, { payload }) => {
      return {
        ...state,
        items: [...payload],
      };
    },
    clearAllItems: (state) => {
      return {
        ...state,
        items: [],
      };
    },
    addNewCategories: (state, { payload }) => {
      return {
        ...state,
        categories: [...payload],
      };
    },
    clearAllCategories: (state) => {
      return {
        ...state,
        categories: [],
      };
    },
    addItem: (state, { payload }) => {
      return {
        ...state,
        items: [
          ...state.items,
          ...payload,
        ],
      };
    },
    addCategory: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...state.categories,
          ...payload,
        ],
      };
    },
  },
})


export const {
  addMenu,
  clearMenu,
  addNewItems,
  clearAllItems,
  addNewCategories,
  clearAllCategories,
  addItem,
  addCategory,
} = menuSlice.actions;

export default menuSlice.reducer;