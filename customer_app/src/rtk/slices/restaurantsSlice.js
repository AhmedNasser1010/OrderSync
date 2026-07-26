import { createSlice } from '@reduxjs/toolkit'

export const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState: [],
  reducers: {
    initRestaurants: (state, { payload }) => {
      return payload.filter(r => r.status !== 'hidden')
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