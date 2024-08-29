import { createSlice } from '@reduxjs/toolkit'

export const filterSlice = createSlice({
  name: 'filter',
  initialState: [],
  reducers: {
    addFilter: (state, { payload }) => {
      return [...state, payload]
    },
    removeFilter: (state, { payload }) => {
      return state.filter((filter) => filter !== payload)
    },
    clearAll: () => {
      return []
    },
    deleteAllExcepts: (state, { payload }) => {
      return state.filter((filter) => payload.includes(filter))
    },
  },
})


export const {
  addFilter,
  removeFilter,
  clearAll,
  deleteAllExcepts
} = filterSlice.actions

export default filterSlice.reducer