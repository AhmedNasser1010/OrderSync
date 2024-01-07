import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Functions
import _addDoc from "../../function/_addDoc.js";
import _getDocs from "../../function/_getDocs.js";
import _deleteDoc from "../../function/_deleteDoc.js";
import _updateDoc from "../../function/_updateDoc.js";


export const fetchBusinesses = createAsyncThunk("businesses/fetchBusinesses", (userId, thunkAPI) => {

  const currentState = thunkAPI.getState().businesses;

  if (currentState.length === 0) {
    return _getDocs("businesses");
  }

  return currentState;
});


export const businessesSlice = createSlice({
  name: 'businesses',
  initialState: [],
  reducers: {
    deleteBusiness: (state, { payload }) => {
      _deleteDoc("businesses", payload);
      return state.filter(business => business.accessToken !== payload);
    },
    updateBusiness: (state, { payload }) => {
      _updateDoc("businesses", payload, payload.accessToken);
      return state.map(business => {
        if (business.accessToken === payload.accessToken) {
          return payload;
        } else {
          return business;
        }
      })
    },
    addBusiness: (state, { payload }) => {
      _addDoc("businesses", payload, payload.accessToken);
      return [...state, payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBusinesses.fulfilled, (state, { payload }) => {
      return payload;
    })
  },
})


export const { deleteBusiness, updateBusiness, addBusiness } = businessesSlice.actions;
export default businessesSlice.reducer;