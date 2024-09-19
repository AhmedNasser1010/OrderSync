import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  arrayUnion,
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { db } from '../../config/firebase'

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['OpenQueue'],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchOpenOrdersData: builder.query({
      async queryFn(resId) {
        try {
          const openQueueRef = collection(db, 'orders', resId, 'openQueue')
          const openQueueSnapshot = await getDocs(openQueueRef)
          const openQueue = openQueueSnapshot.docs.map((doc) => doc.data())
          console.log('Read Operation [openQueue]')
          return { data: openQueue }
        } catch (error) {
          console.error(error?.message)
          return { error: error?.message }
        }
      },
      providesTags: ['OpenQueue']
    }),

    // Mutation Endpoints
    setPlaceOrder: builder.mutation({
      async queryFn(orderData) {
        try {
          // Validate input data
          if (!orderData) {
            throw new Error('Order data is required.')
          }

          // References to Firestore collection
          const openQueueRef = collection(db, 'orders', orderData.accessToken, 'openQueue')
          const customerRef = doc(db, 'customers', orderData.customer.uid)

          // Add new order to the open queue
          const batch = writeBatch(db);

          const newOrderRef = doc(openQueueRef, orderData.id);

          batch.set(newOrderRef, orderData);
          batch.update(customerRef, {
            trackedOrder: {
              id: orderData.id,
              restaurant: orderData.accessToken
            }
          });

          await batch.commit();

          console.log('New order added to openQueue')
          return { data: null }
        } catch (error) {
          console.error('Error while place a new order:', error.message)
          return { error: error.message }
        }
      },
      invalidatesTags: ['OpenQueue']
    })
  })
})

export const {
  useFetchOpenOrdersDataQuery,
  useSetPlaceOrderMutation,
} = firestoreApi;