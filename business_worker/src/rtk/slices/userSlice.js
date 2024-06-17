import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {},
  reducers: {
    addUser: (state, { payload }) => {
      return payload
    },
    clearUser: (state) => {
      return {}
    },
  },
})


export const {
  addUser,
  clearUser
} = userSlice.actions

export default userSlice.reducer