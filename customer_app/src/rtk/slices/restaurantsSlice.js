import { createSlice } from '@reduxjs/toolkit'

export const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState: [],
  reducers: {
    initRestaurants: (state, { payload }) => {
      return payload
    },
    clearRestaurants: (state, { payload }) => {
      return []
    }
  },
})


export const {
  initRestaurants,
  clearRestaurants
} = restaurantsSlice.actions

export default restaurantsSlice.reducer