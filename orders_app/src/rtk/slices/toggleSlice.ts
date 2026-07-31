import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { MainTabTypes } from "@/types/orders";
import type { OrderStatusType } from "@ordersync/types";

type Toggle = {
  reasonDialog: {
    isOpen: boolean;
    orderId: string | null;
    status: OrderStatusType | null;
    reason: string | null;
    error: string | null;
  };
  closeDayPopup: {
    isOpen: boolean;
    isLoading: boolean;
    result: {
      type: "success" | "error" | null;
      text: string;
    };
    errors: {
      noQueue: {
        isPassed: boolean;
        text: string;
      };
      hasCompletedOrders: {
        isPassed: boolean;
        text: string;
      };
    };
  };
  activeTab: MainTabTypes;
  optionsMenuView: boolean;
};

const initialState: Toggle = {
  reasonDialog: {
    isOpen: false,
    orderId: null,
    status: null,
    reason: null,
    error: null,
  },
  closeDayPopup: {
    isOpen: false,
    isLoading: true,
    result: {
      type: null,
      text: ""
    },
    errors: {
      noQueue: {
        isPassed: false,
        text: ""
      },
      hasCompletedOrders: {
        isPassed: false,
        text: ""
      }
    },
  },
  activeTab: "RECEIVED",
  optionsMenuView: false,
};

export const toggleSlice = createSlice({
  name: "toggle",
  initialState,
  reducers: {
    setReasonDialog(state, { payload }) {
      state.reasonDialog = { ...state.reasonDialog, ...payload };
    },
    setCloseDayPopup(state, { payload }) {
      state.closeDayPopup = { ...state.closeDayPopup, ...payload };
    },
    setActiveTab(state, { payload }) {
      state.activeTab = payload;
    },
    setOptionsMenuView(state, { payload }) {
      state.optionsMenuView = payload;
    }
  },
});

export const {
  setReasonDialog,
  setCloseDayPopup,
  setActiveTab,
  setOptionsMenuView,
} = toggleSlice.actions;

export const reasonDialog = (state: RootState) => state.toggle.reasonDialog;
export const closeDayPopup = (state: RootState) => state.toggle.closeDayPopup;
export const activeTab = (state: RootState) => state.toggle.activeTab;
export const optionMenuView = (state: RootState) => state.toggle.optionsMenuView;

export default toggleSlice.reducer;
