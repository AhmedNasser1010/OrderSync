import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  searchTerm: string;
  isDark: boolean;
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
  sidebarOpen: true,
  searchTerm: "",
  isDark: loadInitialTheme(),
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
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
  },
});

export const { toggleSidebar, setSidebarOpen, setSearchTerm, toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
