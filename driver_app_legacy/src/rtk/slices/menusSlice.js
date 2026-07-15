import { createSlice } from '@reduxjs/toolkit'

export const menusSlice = createSlice({
  name: 'menu',
  initialState: [],
  reducers: {
    initMenus: (state, { payload }) => {
      return payload
    },
    clearMenus: (state, { payload }) => {
      return []
    }
  },
})


export const {
  initMenus,
  clearMenus
} = menusSlice.actions

export default menusSlice.reducer