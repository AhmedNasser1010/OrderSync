import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PromoCode } from "@ordersync/types";

interface PromoCodesState {
  promoCodes: PromoCode[];
  dialogOpen: boolean;
  editingPromoCode: PromoCode | null;
}

const initialState: PromoCodesState = {
  promoCodes: [],
  dialogOpen: false,
  editingPromoCode: null,
};

export const promoCodesSlice = createSlice({
  name: "promoCodes",
  initialState,
  reducers: {
    setPromoCodes: (state, { payload }: PayloadAction<PromoCode[]>) => {
      state.promoCodes = payload;
    },
    addPromoCode: (state, { payload }: PayloadAction<PromoCode>) => {
      state.promoCodes.push(payload);
    },
    updatePromoCode: (
      state,
      { payload }: PayloadAction<{ id: string; updates: Partial<PromoCode> }>
    ) => {
      state.promoCodes = state.promoCodes.map((pc) =>
        pc.id === payload.id ? { ...pc, ...payload.updates } : pc
      );
    },
    removePromoCode: (state, { payload }: PayloadAction<{ id: string }>) => {
      state.promoCodes = state.promoCodes.filter((pc) => pc.id !== payload.id);
    },
    togglePromoCodeActive: (
      state,
      { payload }: PayloadAction<{ id: string }>
    ) => {
      const promo = state.promoCodes.find((pc) => pc.id === payload.id);
      if (promo) {
        promo.active = !promo.active;
      }
    },
    openPromoDialog: (state, { payload }: PayloadAction<PromoCode | null>) => {
      state.dialogOpen = true;
      state.editingPromoCode = payload;
    },
    closePromoDialog: (state) => {
      state.dialogOpen = false;
      state.editingPromoCode = null;
    },
  },
});

export const {
  setPromoCodes,
  addPromoCode,
  updatePromoCode,
  removePromoCode,
  togglePromoCodeActive,
  openPromoDialog,
  closePromoDialog,
} = promoCodesSlice.actions;

export default promoCodesSlice.reducer;
