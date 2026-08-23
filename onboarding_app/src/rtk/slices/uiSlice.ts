import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderLookupField } from '../api/firestoreApi';

export interface OrderLookupCandidate {
  uid: string;
  name: string;
  phone?: string;
  targetField: OrderLookupField;
}

export interface OrderLookupState {
  field: OrderLookupField | 'driverName' | 'customerName';
  inputValue: string;
  search: { field: OrderLookupField; value: string; businessIds: string[] } | null;
  candidates: OrderLookupCandidate[];
  notice: string | null;
}

interface UiState {
  searchTerm: string;
  isDark: boolean;
  orderLookup: OrderLookupState;
}

function loadInitialTheme(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  }
  return false;
}

const initialState: UiState = {
  searchTerm: "",
  isDark: loadInitialTheme(),
  orderLookup: {
    field: "orderId",
    inputValue: "",
    search: null,
    candidates: [],
    notice: null,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
      }
    },
    setTheme: (state, action) => {
      state.isDark = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.isDark ? 'dark' : 'light');
      }
    },
    patchOrderLookup: (state, action: PayloadAction<Partial<OrderLookupState>>) => {
      state.orderLookup = { ...state.orderLookup, ...action.payload };
    },
  },
});

export const { setSearchTerm, toggleTheme, setTheme, patchOrderLookup } = uiSlice.actions;
export default uiSlice.reducer;
