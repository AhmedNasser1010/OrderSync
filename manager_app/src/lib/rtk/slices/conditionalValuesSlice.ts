import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DiscountObject, DiscountLevel } from "@ordersync/types";

interface ConditionalValuesState {
  discountDialogOpen: boolean;
  discountDialogLevel: DiscountLevel;
  editingDiscount: DiscountObject | null;
  editingDiscountContext: {
    type: "item" | "category";
    itemId?: string;
    categoryId?: string;
  } | null;
}

const initialState: ConditionalValuesState = {
  discountDialogOpen: false,
  discountDialogLevel: "item",
  editingDiscount: null,
  editingDiscountContext: null,
};

export const conditionalValuesSlice = createSlice({
  name: "conditionalValues",
  initialState,
  reducers: {
    openDiscountDialog: (
      state,
      {
        payload,
      }: PayloadAction<{
        level: DiscountLevel;
        context?: { type: "item" | "category"; itemId?: string; categoryId?: string };
        edit?: DiscountObject;
      }>
    ) => {
      state.discountDialogOpen = true;
      state.discountDialogLevel = payload.level;
      state.editingDiscountContext = payload.context ?? null;
      state.editingDiscount = payload.edit ?? null;
    },
    closeDiscountDialog: (state) => {
      state.discountDialogOpen = false;
      state.editingDiscount = null;
      state.editingDiscountContext = null;
    },
  },
});

export const { openDiscountDialog, closeDiscountDialog } =
  conditionalValuesSlice.actions;

export default conditionalValuesSlice.reducer;
