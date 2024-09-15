import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { OrderStatus } from "@/types/order";

type UserStatus = "active" | "inactive" | "busy";

type Toggle = {
  deletePopup: {
    isOpen: boolean;
    orderId: string | null;
    cancellationReason: string | null;
    error: string | null;
  };
  activeTab: OrderStatus;
  optionsMenuView: boolean;
};

const initialState: Toggle = {
  deletePopup: {
    isOpen: false,
    orderId: null,
    cancellationReason: null,
    error: null,
  },
  activeTab: "RECEIVED",
  optionsMenuView: false
};

export const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    setDeletePopup(state, { payload }) {
      state.deletePopup = { ...state.deletePopup, ...payload };
    },
    setActiveTab(state, { payload }) {
      state.activeTab = payload;
    },
    setOptionsMenuView(state, { payload }) {
      state.optionsMenuView = payload;
    },
  },
});

export const { setDeletePopup, setActiveTab, setOptionsMenuView } =
  toggleSlice.actions;

export const deletePopup = (state: RootState) => state.toggle.deletePopup;
export const activeTab = (state: RootState) => state.toggle.activeTab;
export const optionMenuView = (state: RootState) => state.toggle.optionsMenuView;

export default toggleSlice.reducer;
