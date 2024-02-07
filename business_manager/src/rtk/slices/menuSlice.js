import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { title: 'Espresso', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'hot-drinks', price: 2.50, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'] },
    { title: 'Cappuccino', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'hot-drinks', price: 3.50, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'] },
    { title: 'Iced Latte', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'cold-drinks', price: 4, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'] },
    { title: 'Cold Brew', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'cold-drinks', price: 3.75, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'] },
  ],
  categories: [
    { title: 'hot-drinks', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', background: '' },
    { title: 'cold-drinks', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', background: '' },
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