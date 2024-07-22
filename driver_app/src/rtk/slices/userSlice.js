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
    setUserOnlineStatus: (state, { payload }) => {
      return {
        ...state,
        online: {
          ...state.online,
          byUser: payload
        }
      }
    }
  },
})


export const {
  addUser,
  clearUser,
  setUserOnlineStatus
} = userSlice.actions

export default userSlice.reducer