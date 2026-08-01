import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CategoryType, ItemType, SizeType, DiscountObject } from "@ordersync/types";

export interface MenuState {
  accessToken: string;
  items: ItemType[];
  categories: CategoryType[];
  orderDiscounts: DiscountObject[];
}

const initialState: MenuState = {
  accessToken: "",
  items: [],
  categories: [],
  orderDiscounts: [],
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    initMenu: (_state, { payload }: PayloadAction<MenuState>) => {
      return payload;
    },
    clearMenu: () => {
      return {
        accessToken: "",
        items: [],
        categories: [],
        orderDiscounts: [],
      };
    },
    selectItemSize: (
      state,
      { payload }: PayloadAction<{ id: string; selectedSize: SizeType | null }>
    ) => {
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === payload.id) {
            return {
              ...item,
              selectedSize: payload.selectedSize,
            };
          }
          return item;
        }),
      };
    },
  },
});

export const { initMenu, clearMenu, selectItemSize } = menuSlice.actions;

export default menuSlice.reducer;
