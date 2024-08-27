import { createSlice } from '@reduxjs/toolkit';

export const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    categories: [],
  },
  reducers: {
    addMenu: (state, { payload }) => {
      return {...payload};
    },
    clearMenu: (state) => {
      return {
        items: [],
        categories: [],
      };
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
    categoryIndexesMove: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...payload.map(index => state.categories[index-1])
        ],
      }
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
            if (item.id === payload.id) {
              return payload;
            }
            return item
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
        items: [
          ...state.items.filter(item => item.category !== payload.title)
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
    topCategory: (state, { payload }) => {
      return {
        ...state,
        categories: [
          ...state.categories.map(category => {
            if (category.title === payload.item.title) {
              return {
                ...category,
                topMenu: payload.topMenuValue
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
    topItem: (state, { payload }) => {
      return {
        ...state,
        items: [
          ...state.items.map(item => {
            if (item.title === payload.item.title) {
              return {
                ...item,
                topMenu: payload.topMenuValue
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
    }
  },
})


export const {
  addMenu,
  clearMenu,
  addNewItems,
  clearAllItems,
  addNewCategories,
  clearAllCategories,
  categoryIndexesMove,
  addItem,
  updateItem,
  addCategory,
  updateCategory,
  removeCategory,
  removeItem,
  categoryVisibility,
  topCategory,
  itemVisibility,
  topItem,
  addNewCategoryBackgrounds,
  addNewItemBackgrounds
} = menuSlice.actions;

export default menuSlice.reducer;