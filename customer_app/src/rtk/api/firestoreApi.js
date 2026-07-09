import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  runTransaction
} from 'firebase/firestore'
import { db } from '../../config/firebase'

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['OpenQueue', 'User'],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchOrderTrackingData: builder.query({
      queryFn: () => ({ data: {} }),
      async onCacheEntryAdded(
        { resId, orderId, uid },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
      ) {
        await cacheDataLoaded

        const nextPath = {
          openQueue: 'completedOrders',
          completedOrders: 'voidedOrders'
        }

        let unsubscribe = null
        let orderPath = 'openQueue'

        const changeOrderPath = (newPath) => {
          if (unsubscribe) {
            unsubscribe()
            unsubscribe = null
          }

          orderPath = newPath
          const docRef = doc(db, 'orders', resId, orderPath, `${orderId}_${uid}`)

          unsubscribe = onSnapshot(
            docRef,
            (docSnapshot) => {
              const data = docSnapshot.data()

              if (data?.id) {
                updateCachedData((draft) => {
                  Object.assign(draft, data)
                })
                dispatch({
                  type: 'toggle/setHasOrder',
                  payload: true
                })
              } else {
                if (orderPath === 'voidedOrders') {
                  updateCachedData((draft) => {
                    Object.assign(draft, {})
                  })
                  dispatch({
                    type: 'toggle/setHasOrder',
                    payload: false
                  })
                }

                unsubscribe()
                unsubscribe = null
                changeOrderPath(nextPath[orderPath])
                return
              }

              console.log(`Real-time Update [orderTracking > ${orderPath}]`)
            },
            (error) => {
              console.error(
                `Error in real-time listener [orderTracking > ${orderPath}]:`,
                error?.message
              )
            }
          )
        }

        changeOrderPath(orderPath)

        await cacheEntryRemoved
        if (unsubscribe) {
          unsubscribe()
          unsubscribe = null
        }
      }
    }),

    // Mutation Endpoints
    setPlaceOrder: builder.mutation({
      async queryFn(orderData, { dispatch }) {
        try {
          // Validate input data
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

          // References to Firestore collection
          const openQueueRef = collection(db, 'orders', orderData.accessToken, 'openQueue')
          const customerRef = doc(db, 'customers', orderData.customer.uid)
          const pendingLoyalty = {
            orderId: orderData.id,
            restaurant: orderData.accessToken,
            amount: orderData?.cartTotalPrice?.discount ?? orderData?.cartTotalPrice?.total ?? 0,
            items: Array.isArray(orderData?.cart)
              ? orderData.cart.reduce((sum, item) => sum + (item?.quantity || 0), 0)
              : 0,
            totalOrders: 1,
            firstOrderTime:
              orderData?.customer?.firstOrderDate ?? orderData?.timestamp ?? Date.now(),
            counted: false
          }

          // Add new order to the open queue
          const batch = writeBatch(db)

          const newOrderRef = doc(openQueueRef, `${orderData.id}_${orderData.customer.uid}`)

          batch.set(newOrderRef, orderData)
          batch.update(customerRef, {
            trackedOrder: {
              id: orderData.id,
              restaurant: orderData.accessToken,
              pendingLoyalty
            }
          })

          await batch.commit()

          console.log('New order added to openQueue')
          return { data: null }
        } catch (error) {
          console.error('Error while place a new order:', error.message)
          return { error: error.message }
        }
      },
      invalidatesTags: ['OpenQueue']
    }),
    cancelOrder: builder.mutation({
      async queryFn({ resId, orderData, uid }) {
        try {
          const orderId = orderData.id
          const orderRef = doc(db, 'orders', resId, 'openQueue', `${orderId}_${uid}`)
          const voidedOrderRef = doc(db, 'orders', resId, 'voidedOrders', `${orderId}_${uid}`)
          const customerRef = doc(db, 'customers', uid)
          const timestamp = Date.now()

          const batch = writeBatch(db)

          batch.set(voidedOrderRef, {
            ...orderData,
            status: {
              ...orderData.status,
              cancelledBy: 'customer',
              current: 'CANCELED',
              history: arrayUnion({ status: 'CANCELED', timestamp })
            },
            orderTimestamps: {
              ...orderData.orderTimestamps,
              canceledAt: timestamp
            }
          })

          batch.delete(orderRef)

          batch.update(customerRef, {
            'trackedOrder.id': null
          })

          await batch.commit()
          return { data: {} }
        } catch (error) {
          console.error('Error canceling order:', error.message)
          return { error: error.message }
        }
      },
      invalidatesTags: ['OpenQueue']
    }),
    setOrderFeedback: builder.mutation({
      async queryFn({ orderData, uid, feedback, resId }) {
        try {
          console.log('[setOrderFeedback] Starting feedback submission', {
            orderId: orderData.id,
            uid,
            resId,
            feedback
          })

          const completedOrderRef = doc(
            db,
            'orders',
            orderData.accessToken,
            'completedOrders',
            `${orderData.id}_${uid}`
          )

          const openQueueRef = doc(
            db,
            'orders',
            orderData.accessToken,
            'openQueue',
            `${orderData.id}_${uid}`
          )

          const userRef = doc(db, 'customers', uid)

          const reviewRef = doc(db, 'reviews', orderData.id)

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
            const reviewSnap = await transaction.get(reviewRef)
            const businessSnap = await transaction.get(businessRef)

            if (reviewSnap.exists()) {
              throw new Error('Review already exists for this order')
            }

            const timestamp = Date.now()

            transaction.set(reviewRef, {
              orderId: orderData.id,
              restaurantId: resId,
              customerId: uid,
              rating,
              comment,
              createdAt: timestamp
            })

            transaction.update(completedOrderRef, {
              'customerFeedback.rating': rating,
              'customerFeedback.comment': comment,
              'orderTimestamps.feedbackAt': timestamp
            })

            transaction.delete(openQueueRef)

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
      invalidatesTags: ['OpenQueue']
    }),
    setUserOrderIdToNull: builder.mutation({
      async queryFn(uid) {
        try {
          const customerRef = doc(db, 'customers', uid)

          updateDoc(customerRef, {
            'trackedOrder.id': null
          })

          console.log('User orderId seated to null')
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
  useFetchOpenQueueOrderTrackingDataQuery,
  useSetPlaceOrderMutation,
  useCancelOrderMutation,
  useSetOrderFeedbackMutation,
  useSetUserOrderIdToNullMutation,
  useFinalizePendingLoyaltyMutation
} = firestoreApi
