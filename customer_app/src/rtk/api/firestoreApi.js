import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  runTransaction,
  query,
  where
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { canTransition, getTimelineField } from '@ordersync/order-utils'
import randomOrderNumber from '../../utils/randomOrderId'

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['OrderTracking', 'User'],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchOrderTrackingData: builder.query({
      queryFn: () => ({ data: {} }),
      async onCacheEntryAdded(
        { orderId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        await cacheDataLoaded

        // Listen to the single order document in the global collection
        const orderRef = doc(db, 'orders', orderId)

        const unsubscribe = onSnapshot(
          orderRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data()
              updateCachedData((draft) => {
                Object.assign(draft, data)
              })
              dispatch({
                type: 'toggle/setHasOrder',
                payload: true
              })
            } else {
              updateCachedData((draft) => {
                Object.assign(draft, {})
              })
              dispatch({
                type: 'toggle/setHasOrder',
                payload: false
              })
            }

            console.log('Real-time Update [orderTracking]')
          },
          (error) => {
            console.error(
              'Error in real-time listener [orderTracking]:',
              error?.message
            )
          }
        )

        await cacheEntryRemoved
        unsubscribe()
      }
    }),

    // Mutation Endpoints
    setPlaceOrder: builder.mutation({
      async queryFn(orderData, { dispatch }) {
        try {
          if (!orderData) {
            throw new Error('Order data is required.')
          }

          const restaurantRef = doc(db, 'businesses', orderData.accessToken)
          const restaurantSnap = await getDoc(restaurantRef)

          if (!restaurantSnap.exists()) {
            throw new Error('Restaurant not found.')
          }

          const restaurantData = restaurantSnap.data()
          const restaurantStatus = restaurantData?.status || 'pause'

          if (restaurantStatus === 'inactive' || restaurantStatus === 'pause') {
            return {
              error: {
                code: 'RESTAURANT_NOT_ACCEPTING_ORDERS',
                status: restaurantStatus,
                message: 'This restaurant is currently closed or paused right now.'
              }
            }
          }

          dispatch({
            type: 'toggle/setHasOrder',
            payload: true
          })

          const customerRef = doc(db, 'customers', orderData.customer.uid)

          // Write order to the global collection with RECEIVED status
          const batch = writeBatch(db)

          const orderRef = doc(collection(db, 'orders'))
          const now = Date.now()
          const orderNumber = randomOrderNumber()

          const pendingLoyalty = {
            orderId: orderRef.id,
            restaurant: orderData.accessToken,
            amount: orderData?.pricing?.discount ?? orderData?.pricing?.total ?? 0,
            items: Array.isArray(orderData?.cart)
              ? orderData.cart.reduce((sum, item) => sum + (item?.quantity || 0), 0)
              : 0,
            totalOrders: 1,
            firstOrderTime:
              orderData?.customer?.firstOrderDate ?? orderData?.createdAt ?? Date.now(),
            counted: false
          }

          const newOrder = {
            ...orderData,
            id: orderRef.id,
            orderNumber,
            businessId: orderData.accessToken,
            pricing: {
              subtotal: (orderData.cartTotalPrice?.total ?? 0) - (orderData.deliveryFees ?? 0),
              discount: (orderData.cartTotalPrice?.total ?? 0) - (orderData.cartTotalPrice?.discount ?? 0),
              deliveryFees: orderData.deliveryFees ?? 0,
              total: orderData.cartTotalPrice?.discount ?? orderData.cartTotalPrice?.total ?? 0
            },
            status: {
              current: 'RECEIVED',
              history: [{ status: 'RECEIVED', timestamp: now, by: 'customer' }]
            },
            timeline: {
              ...orderData.timeline,
              placedAt: now
            },
            createdAt: now,
            updatedAt: now
          }

          batch.set(orderRef, newOrder)
          batch.update(customerRef, {
            trackedOrder: {
              id: orderRef.id,
              orderNumber,
              restaurant: orderData.accessToken,
              pendingLoyalty
            }
          })

          await batch.commit()

          console.log('New order placed in global collection')
          return { data: null }
        } catch (error) {
          console.error('Error while placing a new order:', error.message)
          return { error: error.message }
        }
      },
      invalidatesTags: ['OrderTracking']
    }),

    cancelOrder: builder.mutation({
      async queryFn({ orderId, uid }) {
        try {
          if (!orderId || !uid) throw new Error('Order ID and user ID required.')

          const orderRef = doc(db, 'orders', orderId)

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef)
            if (!orderSnap.exists()) {
              throw new Error('Order not found.')
            }

            const order = orderSnap.data()

            if (!canTransition(order.status.current, 'CANCELED')) {
              throw new Error(`Cannot cancel order in status: ${order.status.current}`)
            }

            const now = Date.now()
            const timelineField = getTimelineField('CANCELED')

            transaction.update(orderRef, {
              'status.current': 'CANCELED',
              'status.history': arrayUnion({
                status: 'CANCELED',
                timestamp: now,
                by: 'customer'
              }),
              [`timeline.${timelineField}`]: now,
              updatedAt: now
            })
          })

          // Update customer trackedOrder
          const customerRef = doc(db, 'customers', uid)
          await updateDoc(customerRef, {
            'trackedOrder.id': null
          })

          return { data: {} }
        } catch (error) {
          console.error('Error canceling order:', error.message)
          return { error: error.message }
        }
      },
      invalidatesTags: ['OrderTracking']
    }),

    setOrderFeedback: builder.mutation({
      async queryFn({ orderId, uid, feedback, resId }) {
        try {
          console.log('[setOrderFeedback] Starting feedback submission', {
            orderId,
            uid,
            resId,
            feedback
          })

          const orderRef = doc(db, 'orders', orderId)
          const userRef = doc(db, 'customers', uid)
          const reviewRef = doc(db, 'reviews', orderId)
          const businessRef = doc(db, 'businesses', resId)

          const rating = feedback.rating === 0 ? null : feedback.rating
          const comment = feedback.comment.length === 0 ? null : feedback.comment

          if (!rating && !comment) {
            return { data: null }
          }

          const businessDoc = await getDoc(businessRef)

          if (!businessDoc.exists()) {
            throw new Error(`Business document not found: ${resId}`)
          }

          await runTransaction(db, async (transaction) => {
            const orderSnap = await transaction.get(orderRef)
            const reviewSnap = await transaction.get(reviewRef)
            const businessSnap = await transaction.get(businessRef)

            if (!orderSnap.exists()) {
              throw new Error('Order not found.')
            }

            if (reviewSnap.exists()) {
              throw new Error('Review already exists for this order')
            }

            const order = orderSnap.data()

            if (!canTransition(order.status.current, 'GIVEN_FEEDBACK')) {
              throw new Error(`Cannot give feedback for order in status: ${order.status.current}`)
            }

            const timestamp = Date.now()

            transaction.set(reviewRef, {
              orderId,
              restaurantId: resId,
              customerId: uid,
              rating,
              comment,
              createdAt: timestamp
            })

            transaction.update(orderRef, {
              'customerFeedback': { rating, comment },
              'status.current': 'GIVEN_FEEDBACK',
              'status.history': arrayUnion({
                status: 'GIVEN_FEEDBACK',
                timestamp,
                by: 'customer'
              }),
              'timeline.feedbackAt': timestamp,
              updatedAt: timestamp
            })

            const businessData = businessSnap.data()
            const existingSummary = businessData?.reviewSummary

            const reviewSummary = existingSummary || {
              averageRating: 0,
              totalReviews: 0,
              totalRatingPoints: 0,
              stars: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
              }
            }

            const newTotalReviews = reviewSummary.totalReviews + 1
            const newTotalRatingPoints = reviewSummary.totalRatingPoints + rating

            const newSummary = {
              averageRating: (newTotalRatingPoints / newTotalReviews).toFixed(1),
              totalReviews: newTotalReviews,
              totalRatingPoints: newTotalRatingPoints,
              stars: {
                ...reviewSummary.stars,
                [rating]: (reviewSummary.stars?.[rating] || 0) + 1
              }
            }

            transaction.set(
              businessRef,
              {
                reviewSummary: newSummary
              },
              { merge: true }
            )
          })

          await updateDoc(userRef, {
            'trackedOrder.id': null
          })

          return { data: null }
        } catch (error) {
          console.error('[setOrderFeedback] ERROR:', error)

          return {
            error: {
              code: error?.code,
              message: error?.message
            }
          }
        }
      },
      invalidatesTags: ['OrderTracking']
    }),

    setUserOrderIdToNull: builder.mutation({
      async queryFn(uid) {
        try {
          const customerRef = doc(db, 'customers', uid)

          await updateDoc(customerRef, {
            'trackedOrder.id': null
          })

          console.log('User orderId set to null')
          return { data: null }
        } catch (error) {
          console.error('Error while set customer orderId to null:', error.message)
          return { error: error.message }
        }
      },
      invalidatesTags: ['User']
    }),

    finalizePendingLoyalty: builder.mutation({
      async queryFn({ uid, orderId }) {
        try {
          if (!uid || !orderId) {
            throw new Error('Missing loyalty update parameters')
          }

          const customerRef = doc(db, 'customers', uid)
          const customerSnap = await getDoc(customerRef)

          if (!customerSnap.exists()) {
            throw new Error('Customer document not found')
          }

          const customerData = customerSnap.data()
          const restaurants = Array.isArray(customerData?.restaurants)
            ? customerData.restaurants
            : []
          const pendingLoyalty = customerData?.trackedOrder?.pendingLoyalty
          const alreadyCounted = customerData?.trackedOrder?.loyaltyCountedForOrderId === orderId

          if (!pendingLoyalty || pendingLoyalty.orderId !== orderId) {
            return { data: { skipped: true } }
          }

          const restaurantIndex = restaurants.findIndex(
            (restaurant) => restaurant?.accessToken === pendingLoyalty.restaurant
          )

          if (!alreadyCounted) {
            const updatedRestaurants =
              restaurantIndex >= 0
                ? restaurants.map((restaurant, index) =>
                    index === restaurantIndex
                      ? {
                          ...restaurant,
                          totalAmount: (restaurant.totalAmount || 0) + (pendingLoyalty.amount || 0),
                          totalItems: (restaurant.totalItems || 0) + (pendingLoyalty.items || 0),
                          totalOrders:
                            (restaurant.totalOrders || 0) + (pendingLoyalty.totalOrders || 1),
                          lastOrderTime: Date.now(),
                          firstOrderTime:
                            restaurant.firstOrderTime || pendingLoyalty.firstOrderTime || Date.now()
                        }
                      : restaurant
                  )
                : [
                    ...restaurants,
                    {
                      accessToken: pendingLoyalty.restaurant,
                      totalAmount: pendingLoyalty.amount || 0,
                      totalItems: pendingLoyalty.items || 0,
                      totalOrders: pendingLoyalty.totalOrders || 1,
                      lastOrderTime: Date.now(),
                      firstOrderTime: pendingLoyalty.firstOrderTime || Date.now()
                    }
                  ]

            await updateDoc(customerRef, {
              restaurants: updatedRestaurants,
              'trackedOrder.loyaltyCountedForOrderId': orderId,
              'trackedOrder.pendingLoyalty': null
            })
          }

          return { data: { alreadyCounted } }
        } catch (error) {
          console.error('Error finalizing pending loyalty:', error.message)
          return { error: error.message }
        }
      },
      invalidatesTags: ['User']
    })
  })
})

export const {
  useFetchOrderTrackingDataQuery,
  useSetPlaceOrderMutation,
  useCancelOrderMutation,
  useSetOrderFeedbackMutation,
  useSetUserOrderIdToNullMutation,
  useFinalizePendingLoyaltyMutation
} = firestoreApi
