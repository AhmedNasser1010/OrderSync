import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { title: 'Espresso', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'hot-drinks', price: 2.50, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'], visibility: true },
    { title: 'Cappuccino', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'hot-drinks', price: 3.50, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'], visibility: true },
    { title: 'Chai', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'hot-drinks', price: 1.00, backgrounds: ['', '', '', '', ''], visibility: true },
    { title: 'Iced Latte', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'cold-drinks', price: 4.00, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'], visibility: true },
    { title: 'Cold Brew', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', category: 'cold-drinks', price: 3.75, backgrounds: ['http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50', 'http://via.placeholder.com/50x50'], visibility: true },
  ],
  categories: [
    { title: 'hot-drinks', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', backgrounds: ['http://via.placeholder.com/50x50', '', '', '', ''], visibility: true },
    { title: 'cold-drinks', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', backgrounds: ['', '', '', '', ''], visibility: true },
    { title: 'other', description: 'Lorem ipsum dolor sit, amet consectetur, adipisicing elit.', backgrounds: ['', '', '', '', ''], visibility: false },
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
          payload,
        ],
      };
    },
    updateItem: (state, { payload }) => {
      return {
        ...state,
        items: [
          ...state.items.map(item => {
            if (item.title !== payload.initialValues.title) {
              return item;
            } else {
              return payload.values;
            }
          }),
        ],
      }
    },
    addCategory: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...state.categories,
          payload,
        ],
      };
    },
    updateCategory: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...state.categories.map(category => {
            if (category.title !== payload.initialValues.title) {
              return category;
            } else {
              return payload.values;
            }
          }),
        ],
      }
    },
    removeCategory: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...state.categories.filter(category => category.title !== payload.title)
        ],
      };
    },
    removeItem: (state, { payload }) => {
      return {
        ...state,
        items: [
          ...state.items.filter(item => item.title !== payload.title)
        ],
      };
    },
    categoryVisibility: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...state.categories.map(category => {
            if (category.title === payload.item.title) {
              return {
                ...category,
                visibility: payload.visibilityValue
              }
            } else {
              return category;
            }
          })
        ],
      };
    },
    itemVisibility: (state, { payload }) => {
      return {
        ...state,
        items: [
          ...state.items.map(item => {
            if (item.title === payload.item.title) {
              return {
                ...item,
                visibility: payload.visibilityValue
              }
            } else {
              return item;
            }
          })
        ],
      };
    },
    addNewCategoryBackgrounds: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...state.categories.map(category => {
            if (category.title === payload.title) {
              return {
                ...category,
                backgrounds: payload.data
              };
            } else {
              return category;
            }
          }),

        ]
      }
    },
    addNewItemBackgrounds: (state, { payload }) => {
      return {
        ...state,
        items: [
          ...state.items.map(item => {
            if (item.title === payload.title) {
              return {
                ...item,
                backgrounds: payload.data
              };
            } else {
              return item;
            }
          }),

        ]
      }
    },
    saveToCloud: (state, { payload }) => {
      console.log('saveToCloud reducer menuSlice.js 185:7 from Menu.jsx 111:7');
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
  updateItem,
  addCategory,
  updateCategory,
  removeCategory,
  removeItem,
  categoryVisibility,
  itemVisibility,
  addNewCategoryBackgrounds,
  addNewItemBackgrounds,
  saveToCloud
} = menuSlice.actions;

export default menuSlice.reducer;