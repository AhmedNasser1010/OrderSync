import { createSlice } from '@reduxjs/toolkit';
import { auth } from "../../firebase.js";

// Functions
import _updateAnArray from "../../function/_updateAnArray.js";
import _removeAnArrayItem from "../../function/_removeAnArrayItem.js";

export const userSlice = createSlice({
  name: 'user',
  initialState: {},
  reducers: {
    addUser: (state, { payload }) => {
      return {...payload};
    },
    clearUser: (state) => {
      return {};
    },
    pushAccesTokenToTheUser: (state, { payload }) => {
      _updateAnArray("users", auth.currentUser.uid, "data.businesses", payload);
      return {
        ...state,
        data: {
          ...state.data,
          businesses:[...state.data.businesses, payload],
        },
      };
    },
    deleteAccessTokenFromTheUser: (state, { payload }) => {
      _removeAnArrayItem("users", auth.currentUser.uid, "data.businesses", payload);
      return {
        ...state,
        data: {
          ...state.data,
          businesses: state.data.businesses.filter(item => item !== payload),
        },
      };
    }
  },
})


export const {
  addUser,
  clearUser,
  pushAccesTokenToTheUser,
  deleteAccessTokenFromTheUser
} = userSlice.actions;

export default userSlice.reducer;