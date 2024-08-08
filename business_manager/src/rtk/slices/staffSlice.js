import { createSlice } from '@reduxjs/toolkit'

export const staffSlice = createSlice({
  name: 'staff',
  initialState: [],
  reducers: {
    initStaff: (state, { payload }) => {
      return payload
    },
    clearStaff: () => {
      return []
    },
    newStaff: (state, { payload }) => {
      return [
        ...state,
        payload
      ]
    },
    deleteWorker: (state, { payload }) => {
      return state.filter(worker => worker.uid !== payload)
    },
    workerOnlineStatus: (state, { payload }) => {
      const { id, value } = payload
      return state.map(worker => {
        if (worker.uid === id) {
          return {
            ...worker,
            online: {
              ...worker.online,
              byManager: value
            }
          }
        } else {
          return worker
        }
      })
    },
    resetDues: (state, { payload }) => {
      return state.map(worker => {
        if (worker.uid === payload) {
          return {
            ...worker,
            ordersDues: 0
          }
        } else {
          return worker
        }
      })
    },
    updateStaff: (state, { payload }) => {
      return state.map(member => {
        if (member.uid === payload.uid) {
          return payload
        }
        return member
      })
    }
  },
})


export const {
	initStaff,
	clearStaff,
  newStaff,
  deleteWorker,
  workerOnlineStatus,
  resetDues,
  updateStaff
} = staffSlice.actions

export default staffSlice.reducer