import { createSlice } from '@reduxjs/toolkit'

export const menuSlice = createSlice({
  name: 'menu',
  initialState: [],
  reducers: {
    initMenu: (state, { payload }) => {
      return payload
    },
    clearMenu: (state, { payload }) => {
      return []
    }
  },
})


export const {
  initMenu,
  clearMenu
} = menuSlice.actions

export default menuSlice.reducer