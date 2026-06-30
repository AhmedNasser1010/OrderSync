import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  searchTerm: string;
}

const initialState: UiState = {
  sidebarOpen: true,
  searchTerm: "",
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
  },
});

export const { toggleSidebar, setSidebarOpen, setSearchTerm } = uiSlice.actions;
export default uiSlice.reducer;