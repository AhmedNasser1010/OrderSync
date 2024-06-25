import { createSlice } from '@reduxjs/toolkit';

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    comment: '',
    user: {
      name: null,
      phone: null,
      secondPhone: null
    },
    location: {
      latlng: [null, null],
      address: ''
    },
    payment: {
      method: 'CASH'
    }
  },
  reducers: {
    clearCheckout: (state, { payload }) => {
      return {
        comment: '',
        user: {
          name: null,
          phone: null,
          secondPhone: null
        },
        location: {
          latlng: [null, null],
          address: ''
        },
        payment: {
          method: 'CASH'
        }
      }
    },
    addCheckout: (state, { payload }) => {
      return {
        ...state,
        ...payload
      }
    },
    addToUserLocation: (state, { payload }) => {
      return {
        ...state,
        location: {
          ...state.location,
          ...payload
        }
      }
    }
  },
})


export const {
  clearCheckout,
  addCheckout,
  addToUserLocation
} = checkoutSlice.actions;

export default checkoutSlice.reducer;