import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MenuCategory, MenuData, MenuItem } from "@/lib/types/types";

const initialState: MenuData = {
  categories: [],
  lastSynced: new Date().toISOString(),
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    addMenu: (_state, { payload }: PayloadAction<MenuData>) => payload,
    clearMenu: () => initialState,
    addNewItems: (state, { payload }: PayloadAction<MenuItem[]>) => {
      payload.forEach((item) => {
        const categoryId = item.category ?? (item as any).categoryId;
        const category = state.categories.find((cat) => cat.id === categoryId);
        if (category) {
          category.items.push(item);
        }
      });
    },
    clearAllItems: (state) => {
      state.categories.forEach((category) => {
        category.items = [];
      });
    },
    addNewCategories: (state, { payload }: PayloadAction<MenuCategory[]>) => {
      state.categories = [...state.categories, ...payload];
    },
    clearAllCategories: (state) => {
      state.categories = [];
    },
    categoryIndexesMove: (state, { payload }: PayloadAction<number[]>) => {
      state.categories = payload
        .map((index) => state.categories[index - 1])
        .filter(Boolean) as MenuCategory[];
      state.categories.forEach((category, index) => {
        category.position = index;
      });
    },
    moveCategory: (
      state,
      {
        payload,
      }: PayloadAction<{
        categoryId: string;
        direction: "up" | "down";
      }>,
    ) => {
      const index = state.categories.findIndex(
        (category) => category.id === payload.categoryId,
      );
      if (index === -1) {
        return;
      }

      const targetIndex = payload.direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.categories.length) {
        return;
      }

      [state.categories[index], state.categories[targetIndex]] = [
        state.categories[targetIndex],
        state.categories[index],
      ];
      state.categories.forEach((category, idx) => {
        category.position = idx;
      });
    },
    moveItem: (
      state,
      {
        payload,
      }: PayloadAction<{
        itemId: string;
        direction: "up" | "down";
      }>,
    ) => {
      const category = state.categories.find((cat) =>
        cat.items.some((item) => item.id === payload.itemId),
      );
      if (!category) {
        return;
      }

      const index = category.items.findIndex(
        (item) => item.id === payload.itemId,
      );
      const targetIndex = payload.direction === "up" ? index - 1 : index + 1;
      if (
        index === -1 ||
        targetIndex < 0 ||
        targetIndex >= category.items.length
      ) {
        return;
      }

      [category.items[index], category.items[targetIndex]] = [
        category.items[targetIndex],
        category.items[index],
      ];
    },
    addItem: (state, { payload }: PayloadAction<MenuItem>) => {
      const categoryId = payload.category ?? (payload as any).categoryId;
      const category = state.categories.find((cat) => cat.id === categoryId);
      if (category) {
        category.items.push(payload);
      }
    },
    updateItem: (
      state,
      { payload }: PayloadAction<{ id: string; updates: Partial<MenuItem> }>,
    ) => {
      state.categories.forEach((category) => {
        category.items = category.items.map((item) =>
          item.id === payload.id ? { ...item, ...payload.updates } : item,
        );
      });
    },
    addCategory: (state, { payload }: PayloadAction<MenuCategory>) => {
      state.categories.push(payload);
    },
    updateCategory: (
      state,
      {
        payload,
      }: PayloadAction<{ id: string; updates: Partial<MenuCategory> }>,
    ) => {
      state.categories = state.categories.map((category) =>
        category.id === payload.id
          ? { ...category, ...payload.updates }
          : category,
      );
    },
    removeCategory: (state, { payload }: PayloadAction<{ id: string }>) => {
      state.categories = state.categories.filter(
        (category) => category.id !== payload.id,
      );
    },
    removeItem: (state, { payload }: PayloadAction<{ id: string }>) => {
      state.categories = state.categories.map((category) => ({
        ...category,
        items: category.items.filter((item) => item.id !== payload.id),
      }));
    },
    categoryVisibility: (
      state,
      {
        payload,
      }: PayloadAction<{ categoryId: string; visibilityValue: boolean }>,
    ) => {
      state.categories = state.categories.map((category) =>
        category.id === payload.categoryId
          ? { ...category, visible: payload.visibilityValue }
          : category,
      );
    },
    topCategory: (
      state,
      { payload }: PayloadAction<{ categoryId: string; topMenuValue: boolean }>,
    ) => {
      state.categories = state.categories.map((category) =>
        category.id === payload.categoryId
          ? { ...category, featured: payload.topMenuValue }
          : category,
      );
    },
    itemVisibility: (
      state,
      { payload }: PayloadAction<{ itemId: string; visibilityValue: boolean }>,
    ) => {
      state.categories = state.categories.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === payload.itemId
            ? { ...item, visible: payload.visibilityValue }
            : item,
        ),
      }));
    },
    topItem: (
      state,
      { payload }: PayloadAction<{ itemId: string; topMenuValue: boolean }>,
    ) => {
      state.categories = state.categories.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === payload.itemId
            ? { ...item, featured: payload.topMenuValue }
            : item,
        ),
      }));
    },
    addNewCategoryBackgrounds: (
      state,
      { payload }: PayloadAction<{ categoryId: string; data: string[] }>,
    ) => {
      state.categories = state.categories.map((category) =>
        category.id === payload.categoryId
          ? { ...category, backgrounds: payload.data }
          : category,
      );
    },
    addNewItemBackgrounds: (
      state,
      { payload }: PayloadAction<{ itemId: string; data: string[] }>,
    ) => {
      state.categories = state.categories.map((category) => ({
        ...category,
        items: category.items.map((item) =>
          item.id === payload.itemId
            ? { ...item, backgrounds: payload.data }
            : item,
        ),
      }));
    },
    setLastSynced: (state, { payload }: PayloadAction<string>) => {
      state.lastSynced = payload;
    },
  },
});

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
  addNewItemBackgrounds,
  moveCategory,
  moveItem,
  setLastSynced,
} = menuSlice.actions;

export default menuSlice.reducer;
