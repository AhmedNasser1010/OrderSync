import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Functions
import _addDoc from "../../function/_addDoc.js";
import _getDocs from "../../function/_getDocs.js";
import _deleteDoc from "../../function/_deleteDoc.js";
import _updateDoc from "../../function/_updateDoc.js";
import _getSubcollections from "../../function/_getSubcollections.js";
import auth_signupUser from "../../function/auth_signupUser.js";


export const fetchBusinesses = createAsyncThunk("businesses/fetchBusinesses", (userId, thunkAPI) => {

  const currentState = thunkAPI.getState();

  if (currentState.businesses.length === 0) {
    return _getSubcollections("businesses", currentState.user.data.businesses);
  }

  return currentState.businesses;
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
      _addDoc("businesses", payload, payload.accessToken)
        .then(passed => {
          // add menu to this business
          _addDoc("menus", {items: [], categories: []}, payload.accessToken);
          
          // if passed => signup the business owner in the db
          auth_signupUser(
            {email: payload.owner.contact.email, password: payload.owner.password, accessToken: payload.accessToken},
            "BUSINESS_MANAGER",
            (valid, error) => {
              console.error(error);
            });
        });
      return [...state, payload];
    },
    clearBusinesses: () => {
      return [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBusinesses.fulfilled, (state, { payload }) => {
      return payload;
    })
  },
})


export const { deleteBusiness, updateBusiness, addBusiness, clearBusinesses } = businessesSlice.actions;
export default businessesSlice.reducer;