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
  resStatus: UserStatus;
};

const initialState: Toggle = {
  deletePopup: {
    isOpen: false,
    orderId: null,
    cancellationReason: null,
    error: null,
  },
  activeTab: "RECEIVED",
  resStatus: "inactive",
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
    setResStatus(state, { payload }) {
      state.resStatus = payload;
    },
  },
});

export const { setDeletePopup, setActiveTab, setResStatus } =
  toggleSlice.actions;

export const deletePopup = (state: RootState) => state.toggle.deletePopup;
export const activeTab = (state: RootState) => state.toggle.activeTab;
export const resStatus = (state: RootState) => state.toggle.resStatus;

export default toggleSlice.reducer;
