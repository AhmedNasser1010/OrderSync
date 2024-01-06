import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Functions
import _getDocs from "../../function/_getDocs.js";

export const fetchBusinesses = createAsyncThunk("businesses/fetchBusinesses", (userId, thunkAPI) => {

  const currentState = thunkAPI.getState().businesses.data;

  if (currentState.length === 0) {
    return _getDocs("businesses");
  }

  return currentState;
});

export const businessesSlice = createSlice({
  name: 'businesses',
  initialState: {
    loading: false,
    data: [],
    status: "",
  },
  reducers: {
    deleteBusiness: ({ data }, { payload }) => {
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBusinesses.pending, (state, action) => {
      state.loading = true;
      state.status = "Pending";
    }),
    builder.addCase(fetchBusinesses.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.status = "Fulfilled";
    }),
    builder.addCase(fetchBusinesses.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.status = "Rejected";
    })
  },
})

export const { deleteBusiness } = businessesSlice.actions;
export default businessesSlice.reducer;